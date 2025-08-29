import fs from "fs";
const categories = [
  ["Бакалея","Крупы","Гречка"], ["Бакалея","Крупы","Рис"], ["Бакалея","Макароны"],
  ["Молочные продукты","Молоко"], ["Молочные продукты","Сыры"], ["Молочные продукты","Йогурты"],
  ["Фрукты и Овощи","Фрукты"], ["Фрукты и Овощи","Овощи"],
  ["Мясо и Птица","Курица"], ["Мясо и Птица","Говядина"],
  ["Выпечка","Хлеб"], ["Выпечка","Сладкая выпечка"],
  ["Напитки","Вода"], ["Напитки","Соки"], ["Напитки","Газированные"],
  ["Рыба и Морепродукты","Рыба"], ["Заморозка","Пельмени"],
  ["Снеки","Чипсы"], ["Снеки","Орехи"], ["Сладости","Шоколад"]
];
const brands = ["ФрешМаркет","ГринФуд","МолокоДом","Северные Поля","SunValley","MilkyWay","O2 Aqua","Vitalis","Farm&Co","Makaronika","RiceLand","Сыроварня №1","OceanGift","PelmeniPro","ChocoLand","Crunchy","NuttyBox","JuicyTime","Beef&Best","ChickenFarm"];

function unitFor(cat){ if(cat.includes("Молоко")||cat.includes("Вода")||cat.includes("Соки")||cat.includes("Йогурты")) return "л"; if (cat.includes("Крупы")||cat.includes("Рис")||cat.includes("Гречка")||cat.includes("Макароны")||cat.includes("Пельмени")) return "кг"; return "шт";}
function amt(u){ if(u==="л") return [0.5,0.9,1,1.5,2][Math.floor(Math.random()*5)]; if(u==="кг") return [0.4,0.5,0.8,1,1.5,2][Math.floor(Math.random()*6)]; return 1;}
function nameFor(cat){ const last=cat[cat.length-1]; const r=(a)=>a[Math.floor(Math.random()*a.length)];
  switch(last){
    case "Гречка": return "Крупа гречневая";
    case "Рис": return "Рис длиннозерный";
    case "Макароны": return "Макароны спагетти";
    case "Молоко": return "Молоко ультрапастеризованное 3.2%";
    case "Сыры": return "Сыр сливочный";
    case "Йогурты": return "Йогурт классический";
    case "Фрукты": return r(["Яблоки свежие","Бананы спелые","Апельсины сочные","Груши сладкие"]);
    case "Овощи": return r(["Помидоры розовые","Огурцы хрустящие","Перец сладкий","Картофель молодой"]);
    case "Курица": return "Куриное филе охлажденное";
    case "Говядина": return "Говядина для стейка";
    case "Хлеб": return "Хлеб пшеничный";
    case "Сладкая выпечка": return "Круассаны сливочные";
    case "Вода": return "Вода питьевая негазированная";
    case "Соки": return "Сок яблочный";
    case "Газированные": return "Напиток газированный кола";
    case "Рыба": return "Филе лосося охлажденное";
    case "Пельмени": return "Пельмени классические";
    case "Чипсы": return "Чипсы картофельные";
    case "Орехи": return "Орехи миндаль";
    case "Шоколад": return "Шоколад молочный";
    default: return last;
  }
}
function priceRange(last){ const m={
  "Гречка":[99,199],"Рис":[89,189],"Макароны":[59,149],"Молоко":[59,129],"Сыры":[199,799],
  "Йогурты":[39,99],"Фрукты":[99,299],"Овощи":[49,199],"Курица":[199,399],"Говядина":[399,899],
  "Хлеб":[29,89],"Сладкая выпечка":[79,199],"Вода":[19,79],"Соки":[69,189],"Газированные":[49,149],
  "Рыба":[399,1099],"Пельмени":[199,399],"Чипсы":[69,169],"Орехи":[199,599],"Шоколад":[69,199]
}; return m[last]||[49,299]; }
function img(seed){ return `https://picsum.photos/seed/${seed}/600/400`; }

const items=[];
for(let i=0;i<60;i++){
  const cat = categories[Math.floor(Math.random()*categories.length)];
  const name = nameFor(cat);
  const brand = brands[Math.floor(Math.random()*brands.length)];
  const unit = unitFor(cat.join(" "));
  const amount = amt(unit);
  const [a,b] = priceRange(cat[cat.length-1]);
  const price = Math.round((a + Math.random()*(b-a))*100)/100;
  const id = `p${String(i+1).padStart(4,"0")}`;
  items.push({
    id, name, brand, category: cat, price, unit, amount,
    stock: Math.floor(Math.random()*200),
    description: `${name} от бренда ${brand}. Категория: ${cat.join(" / ")}.`,
    images: [img((name+id).toLowerCase().replace(/[^a-z0-9]/g,""))],
    popularity: Math.floor(Math.random()*1000),
    createdAt: new Date(Date.now()-Math.floor(Math.random()*60)*86400000).toISOString()
  });
}
fs.writeFileSync(new URL("./products.json", import.meta.url), JSON.stringify(items,null,2), "utf-8");
console.log("products.json generated:", items.length);
