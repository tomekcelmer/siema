import { Variant, Role } from '../types';

export const INSTRUCTIONS: Record<string, string[]> = {
  'seller-A': [
    'Posiadasz używany smartfon, który kupiłeś za cenę 700 zł.',
    'Postanawiasz zarobić na jego odsprzedaży korzystając z serwisu ogłoszeniowego.',
    'Wystawiłeś używany smartfon na sprzedaż z informacją: "cena do negocjacji".',
    'Potencjalny nabywca skontaktował się z Tobą za pośrednictwem czatu na stronie z ogłoszeniami. W oknie na następnej stronie możesz porozmawiać z kupującym.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, poniżej której nie zamierzasz schodzić:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona z kupującym.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wynegocjowaną ceną a wartością 700 zł.'
  ],
  'buyer-A': [
    'Postanawiasz skorzystać z serwisu ogłoszeniowego, aby kupić smartfon, mając budżet 1100 zł.',
    'Niedawno znalazłeś interesującą ofertę z informacją, że cena jest do negocjacji.',
    'Aby skontaktować się ze sprzedawcą, korzystasz z funkcji czatu na następnej stronie.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, której nie zamierzasz przekroczyć:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona ze sprzedawcą.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wartością 1100 zł a wynegocjowaną ceną.'
  ],
  'seller-B': [
    'Posiadasz używany smartfon, który kupiłeś za cenę 700 zł.',
    'Postanawiasz zarobić na jego odsprzedaży korzystając z serwisu ogłoszeniowego.',
    'Po wstępnym rozeznaniu udało się ocenić, że taki smartfon może być wart od 800 do 1000 zł.',
    'Potencjalny nabywca skontaktował się z Tobą za pośrednictwem czatu na stronie z ogłoszeniami. W oknie na następnej stronie możesz porozmawiać z kupującym.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, poniżej której nie zamierzasz schodzić:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona z kupującym.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wynegocjowaną ceną a wartością 700 zł.'
  ],
  'buyer-B': [
    'Postanawiasz skorzystać z serwisu ogłoszeniowego, aby kupić smartfon, mając budżet 1100 zł.',
    'Znalazłeś interesującą ofertę, której cenę chcesz negocjować.',
    'Udało ci się ocenić, że oferowany smartfon może być wart od 800 do 1000 zł.',
    'Aby skontaktować się ze sprzedawcą, korzystasz z funkcji czatu na następnej stronie.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, której nie zamierzasz przekroczyć:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona ze sprzedawcą.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wartością 1100 zł a wynegocjowaną ceną.'
  ],
  'seller-C': [
    'Posiadasz używany smartfon, który kupiłeś za cenę 700 zł.',
    'Postanawiasz zarobić na jego odsprzedaży korzystając z serwisu ogłoszeniowego.',
    'Wystawiłeś używany smartfon na sprzedaż z informacją: "cena do negocjacji".',
    'Przygotowując się, przemyślałeś swoją strategię i niedawno dowiedziałeś się, że korzystnie jest zapytać o najlepszą cenę. W związku z tym, na początku negocjacji zostanie zadane pytanie kupującemu: "Jaka jest najwyższa cena, którą byś zaakceptował?".',
    'Potencjalny nabywca skontaktował się z Tobą za pośrednictwem czatu na stronie z ogłoszeniami. W oknie na następnej stronie możesz porozmawiać z kupującym.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, poniżej której nie zamierzasz schodzić:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona z kupującym.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wynegocjowaną ceną a wartością 700 zł.'
  ],
  'buyer-C': [
    'Postanawiasz skorzystać z serwisu ogłoszeniowego, aby kupić smartfon, mając budżet 1100 zł.',
    'Niedawno znalazłeś interesującą ofertę z informacją, że cena jest do negocjacji.',
    'Aby skontaktować się ze sprzedawcą, korzystasz z funkcji czatu na następnej stronie.',
    'Negocjacja zostanie otwarta pytaniem sprzedawcy.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, której nie zamierzasz przekroczyć:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona ze sprzedawcą.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wartością 1100 zł a wynegocjowaną ceną.'
  ],
  'seller-D': [
    'Posiadasz używany smartfon, który kupiłeś za cenę 700 zł.',
    'Postanawiasz zarobić na jego odsprzedaży korzystając z serwisu ogłoszeniowego.',
    'Po wstępnym rozeznaniu udało się ocenić, że taki smartfon może być wart od 800 do 1000 zł.',
    'Przygotowując się, przemyślałeś swoją strategię i niedawno dowiedziałeś się, że korzystnie jest zapytać o najlepszą cenę. W związku z tym, na początku negocjacji zostanie zadane pytanie kupującemu: "Jaka jest najwyższa cena, którą byś zaakceptował?".',
    'Potencjalny nabywca skontaktował się z Tobą za pośrednictwem czatu na stronie z ogłoszeniami. W oknie na następnej stronie możesz porozmawiać z kupującym.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, poniżej której nie zamierzasz schodzić:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona z kupującym.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wynegocjowaną ceną a wartością 700 zł.'
  ],
  'buyer-D': [
    'Postanawiasz skorzystać z serwisu ogłoszeniowego, aby kupić smartfon, mając budżet 1100 zł.',
    'Znalazłeś interesującą ofertę, której cenę chcesz negocjować.',
    'Udało ci się ocenić, że oferowany smartfon może być wart od 800 do 1000 zł.',
    'Aby skontaktować się ze sprzedawcą, korzystasz z funkcji czatu na następnej stronie.',
    'Negocjacja zostanie otwarta pytaniem sprzedawcy.',
    '',
    'Zanim przejdziesz do czatu, wpisz cenę, której nie zamierzasz przekroczyć:',
    '*Wpisana cena nie jest zobowiązująca i nie wpływa na przebieg negocjacji.',
    '',
    'Negocjuj cenę sprzedaży używanego smartfona ze sprzedawcą.',
    'Masz 10 minut czasu na negocjacje.',
    'Warunkiem otrzymania nagrody jest zawarcie transakcji.',
    'Twoja nagroda równa jest różnicy między wartością 1100 zł a wynegocjowaną ceną.'
  ]
};

export function getInstructions(role: Role, variant: Variant): string[] {
  const key = `${role}-${variant}`;
  return INSTRUCTIONS[key] || [];
}

export function hasAutoMessage(variant: Variant): boolean {
  return variant === 'C' || variant === 'D';
}

export const AUTO_MESSAGE = 'Jaka jest najwyższa cena, którą byś zaakceptował?';
