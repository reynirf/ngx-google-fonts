import { Injectable } from '@angular/core';
import { CollectPendingMethodInvocations } from '@byte-this/funscript';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {
  AvlSortedList,
  iWordWithData,
  SortedTrie,
  Trie,
} from '@byte-this/collections';
import * as WebFont from 'webfontloader';

@Injectable({
  providedIn: 'root',
})
export class GoogleFontService {
  KIND_WEB_SAFE_FONT = 'Web Safe Font';

  private apiLoaded = false;

  /**
   * We'll use a trie data structure to facilitate
   * fast lookups and prefix lookups
   *
   * For more info on tries: https://bytethisstore.com/articles/pg/trie
   */
  private fontsTrie = new Trie<string>();

  private fonts?: string[] = undefined;

  constructor(private httpClient: HttpClient) {}

  /**
   * Init default fonts, such as courier new
   * These are not google fonts, and we can add them directly
   */
  private getDefaultFonts(): AvlSortedList<string> {
    const sortedList = new AvlSortedList<string>((a, b) => {
      return a.localeCompare(b);
    });
    // for (const fontName of WEB_SAFE_FONT_NAMES) {
    //     sortedList.add({
    //         family: fontName,
    //         variants: [],
    //         subsets: [],
    //         version: "",
    //         lastModified: "",
    //         files: {},
    //         category: this.KIND_WEB_SAFE_FONT,
    //         kind: this.KIND_WEB_SAFE_FONT
    //     });
    // }
    return sortedList;
  }

  setFonts(fonts?: string[]): void {
    this.fonts = fonts;
  }

  /**
   * Get a font by its family name, or void if there is none
   */
  async getFontByFamilyName(familyName: string): Promise<string | void> {
    await this.fetchFontList();
    return this.fontsTrie.getWordData(this.normalizeWord(familyName));
  }

  /**
   * Get the list of fonts as an iterable structure
   */
  async getFontsIterable(
    prefix: string = ''
  ): Promise<Iterable<iWordWithData<string>>> {
    await this.fetchFontList();
    const data = this.fontsTrie.getAllWordsDataWithPrefix(
      this.normalizeWord(prefix)
    );
    return data;
  }

  /**
   * Attempt to load a font
   *
   * Return true if success, or already loaded, false otherwise
   */
  async tryLoadFont(fontFamily: string): Promise<boolean> {
    await this.fetchFontList();
    const fontData = this.fontsTrie.getWordData(this.normalizeWord(fontFamily));
    //guard against invalid font family name
    if (!fontData) {
      return false;
    }

    //load font if not web font
    // if (fontData.kind === this.KIND_WEB_SAFE_FONT) {
    //   return true;
    // }
    try {
      await WebFont.load({
        google: {
          families: [fontFamily],
        },
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  @CollectPendingMethodInvocations
  private async fetchFontList(): Promise<void> {
    //only load once
    if (this.apiLoaded || !this.fonts) {
      return;
    }

    const sortedFonts = this.getDefaultFonts();

    for (const font of this.fonts) {
      // this.fontsTrie.addWord(this.normalizeWord(font.family), font);
      sortedFonts.add(font);
    }

    //now that fonts are sorted, add all to trie
    for (const font of sortedFonts) {
      this.fontsTrie.addWord(this.normalizeWord(font), font);
    }

    this.apiLoaded = true;
  }

  /**
   * The trie will store words as lowercase
   */
  private normalizeWord(word: string): string {
    return word.toLowerCase().trim();
  }
}
