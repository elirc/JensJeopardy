import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

interface SeedGame {
  slug: string;
  title: string;
  description: string;
  officialVersion: number;
  rounds: {
    number: number;
    categories: {
      name: string;
      order: number;
      clues: {
        order: number;
        value: number;
        question: string;
        answer: string;
        dailyDouble: boolean;
      }[];
    }[];
  }[];
  finalClue?: {
    category: string;
    question: string;
    answer: string;
  };
}

const officialGames: SeedGame[] = [
  {
    slug: "general-knowledge-101",
    title: "General Knowledge 101",
    description:
      "A fun introductory game covering science, history, geography, pop culture, and more!",
    officialVersion: 1,
    rounds: [
      {
        number: 1,
        categories: [
          {
            name: "Science",
            order: 0,
            clues: [
              { order: 1, value: 200, question: "This planet is known as the Red Planet.", answer: "What is Mars?", dailyDouble: false },
              { order: 2, value: 400, question: "This element has the chemical symbol 'O'.", answer: "What is Oxygen?", dailyDouble: false },
              { order: 3, value: 600, question: "This force keeps us on the ground.", answer: "What is gravity?", dailyDouble: false },
              { order: 4, value: 800, question: "This organ pumps blood through the human body.", answer: "What is the heart?", dailyDouble: false },
              { order: 5, value: 1000, question: "This scientist developed the theory of general relativity.", answer: "Who is Albert Einstein?", dailyDouble: false },
            ],
          },
          {
            name: "U.S. History",
            order: 1,
            clues: [
              { order: 1, value: 200, question: "This document declared independence from Britain in 1776.", answer: "What is the Declaration of Independence?", dailyDouble: false },
              { order: 2, value: 400, question: "This president issued the Emancipation Proclamation.", answer: "Who is Abraham Lincoln?", dailyDouble: false },
              { order: 3, value: 600, question: "This war was fought between the North and South from 1861-1865.", answer: "What is the Civil War?", dailyDouble: true },
              { order: 4, value: 800, question: "This amendment gave women the right to vote.", answer: "What is the 19th Amendment?", dailyDouble: false },
              { order: 5, value: 1000, question: "This event on December 7, 1941 brought the U.S. into WWII.", answer: "What is the attack on Pearl Harbor?", dailyDouble: false },
            ],
          },
          {
            name: "Geography",
            order: 2,
            clues: [
              { order: 1, value: 200, question: "This is the largest ocean on Earth.", answer: "What is the Pacific Ocean?", dailyDouble: false },
              { order: 2, value: 400, question: "This country has the largest population in the world.", answer: "What is India?", dailyDouble: false },
              { order: 3, value: 600, question: "This is the longest river in Africa.", answer: "What is the Nile?", dailyDouble: false },
              { order: 4, value: 800, question: "This mountain is the tallest in the world.", answer: "What is Mount Everest?", dailyDouble: false },
              { order: 5, value: 1000, question: "This desert is the largest hot desert in the world.", answer: "What is the Sahara?", dailyDouble: false },
            ],
          },
          {
            name: "Pop Culture",
            order: 3,
            clues: [
              { order: 1, value: 200, question: "This wizard attends Hogwarts School of Witchcraft and Wizardry.", answer: "Who is Harry Potter?", dailyDouble: false },
              { order: 2, value: 400, question: "This superhero is also known as the Man of Steel.", answer: "Who is Superman?", dailyDouble: false },
              { order: 3, value: 600, question: "This animated film features a clownfish named Marlin searching for his son.", answer: "What is Finding Nemo?", dailyDouble: false },
              { order: 4, value: 800, question: "This band sang 'Bohemian Rhapsody'.", answer: "Who is Queen?", dailyDouble: false },
              { order: 5, value: 1000, question: "This TV show features dragons and the Iron Throne.", answer: "What is Game of Thrones?", dailyDouble: false },
            ],
          },
          {
            name: "Food & Drink",
            order: 4,
            clues: [
              { order: 1, value: 200, question: "This Italian dish is made with flat pasta sheets, meat sauce, and cheese.", answer: "What is lasagna?", dailyDouble: false },
              { order: 2, value: 400, question: "This fruit is the main ingredient in guacamole.", answer: "What is an avocado?", dailyDouble: false },
              { order: 3, value: 600, question: "This country is famous for sushi and ramen.", answer: "What is Japan?", dailyDouble: false },
              { order: 4, value: 800, question: "This spice gives curry its yellow color.", answer: "What is turmeric?", dailyDouble: false },
              { order: 5, value: 1000, question: "This French pastry is made of choux dough and filled with cream.", answer: "What is an eclair?", dailyDouble: false },
            ],
          },
          {
            name: "Sports",
            order: 5,
            clues: [
              { order: 1, value: 200, question: "This sport uses a round orange ball and a hoop.", answer: "What is basketball?", dailyDouble: false },
              { order: 2, value: 400, question: "This country has won the most FIFA World Cup titles.", answer: "What is Brazil?", dailyDouble: false },
              { order: 3, value: 600, question: "This tennis Grand Slam is played on grass courts.", answer: "What is Wimbledon?", dailyDouble: false },
              { order: 4, value: 800, question: "This boxer was known as 'The Greatest' and could 'float like a butterfly'.", answer: "Who is Muhammad Ali?", dailyDouble: false },
              { order: 5, value: 1000, question: "This event is held every four years and features athletes from around the world.", answer: "What are the Olympic Games?", dailyDouble: false },
            ],
          },
        ],
      },
    ],
    finalClue: {
      category: "World Leaders",
      question:
        "This leader, who served as President of South Africa from 1994-1999, spent 27 years in prison before becoming the nation's first Black president.",
      answer: "Who is Nelson Mandela?",
    },
  },
  {
    slug: "passover-seder-challenge",
    title: "Passover Seder Challenge",
    description:
      "A prebuilt Jewish/Passover game covering Seder symbols, the Exodus story, the Four Questions, and the Ten Plagues.",
    officialVersion: 1,
    rounds: [
      {
        number: 1,
        categories: [
          {
            name: "Seder Plate Symbols",
            order: 0,
            clues: [
              { order: 1, value: 200, question: "This bitter herb, often horseradish, represents the bitterness of slavery in Egypt.", answer: "What is maror?", dailyDouble: false },
              { order: 2, value: 400, question: "This sweet fruit-and-nut mixture symbolizes the mortar used by Hebrew slaves.", answer: "What is charoset?", dailyDouble: false },
              { order: 3, value: 600, question: "This roasted item on the Seder plate symbolizes the Passover sacrifice in Temple times.", answer: "What is the zeroa (shank bone)?", dailyDouble: false },
              { order: 4, value: 800, question: "This vegetable is dipped in salt water early in the Seder.", answer: "What is karpas?", dailyDouble: false },
              { order: 5, value: 1000, question: "This egg on the Seder plate symbolizes the festival offering and mourning for the destroyed Temple.", answer: "What is a beitzah (egg)?", dailyDouble: false },
            ],
          },
          {
            name: "Seder Order",
            order: 1,
            clues: [
              { order: 1, value: 200, question: "The Hebrew word for the ritual Passover meal literally means this.", answer: "What is order?", dailyDouble: false },
              { order: 2, value: 400, question: "Kadesh is this numbered step in the traditional 15-step Seder order.", answer: "What is the first step?", dailyDouble: false },
              { order: 3, value: 600, question: "This section of the Seder is when the Exodus story is told.", answer: "What is Maggid?", dailyDouble: false },
              { order: 4, value: 800, question: "The hidden afikoman is eaten during this Seder step.", answer: "What is Tzafun?", dailyDouble: false },
              { order: 5, value: 1000, question: "This late Seder section includes songs of praise such as Hallel.", answer: "What is Hallel?", dailyDouble: false },
            ],
          },
          {
            name: "Four Questions & Cups",
            order: 2,
            clues: [
              { order: 1, value: 200, question: "Traditionally, this person asks or sings the Four Questions (Ma Nishtanah).", answer: "Who is the youngest child?", dailyDouble: false },
              { order: 2, value: 400, question: "This many cups of wine or grape juice are drunk during the Seder.", answer: "What is four?", dailyDouble: false },
              { order: 3, value: 600, question: "One Four Question asks why, on this night, we dip foods this many times.", answer: "What is two?", dailyDouble: false },
              { order: 4, value: 800, question: "Another Four Question asks why, on this night, we eat only this bread and not chametz.", answer: "What is matzah?", dailyDouble: false },
              { order: 5, value: 1000, question: "When drinking the four cups, many participants recline to this side as a symbol of freedom.", answer: "What is the left side?", dailyDouble: false },
            ],
          },
          {
            name: "Ten Plagues",
            order: 3,
            clues: [
              { order: 1, value: 200, question: "The first plague turned the Nile River into this.", answer: "What is blood?", dailyDouble: false },
              { order: 2, value: 400, question: "This plague came right after blood in the traditional order.", answer: "What are frogs?", dailyDouble: false },
              { order: 3, value: 600, question: "This tiny pest is usually listed as the third plague.", answer: "What are lice?", dailyDouble: true },
              { order: 4, value: 800, question: "The ninth plague, choshech, is translated as this.", answer: "What is darkness?", dailyDouble: false },
              { order: 5, value: 1000, question: "The tenth and final plague was the death of these in Egypt.", answer: "Who are the firstborn?", dailyDouble: false },
            ],
          },
          {
            name: "Exodus Story",
            order: 4,
            clues: [
              { order: 1, value: 200, question: "This prophet confronted Pharaoh and led the Israelites out of Egypt.", answer: "Who is Moses?", dailyDouble: false },
              { order: 2, value: 400, question: "Fill in the famous demand to Pharaoh: Let my people ____.", answer: "What is go?", dailyDouble: false },
              { order: 3, value: 600, question: "After leaving Egypt, the Israelites crossed this sea.", answer: "What is the Red Sea (Sea of Reeds)?", dailyDouble: false },
              { order: 4, value: 800, question: "Passover begins on the 15th of this Hebrew month.", answer: "What is Nisan?", dailyDouble: false },
              { order: 5, value: 1000, question: "The Torah command linked to Passover says to eat matzah for this many days in Israel.", answer: "What is seven days?", dailyDouble: false },
            ],
          },
          {
            name: "Passover Traditions",
            order: 5,
            clues: [
              { order: 1, value: 200, question: "Leavened food removed from Jewish homes before Passover is called this.", answer: "What is chametz?", dailyDouble: false },
              { order: 2, value: 400, question: "A special cup is poured for this prophet during the Seder.", answer: "Who is Elijah?", dailyDouble: false },
              { order: 3, value: 600, question: "Children often search for this hidden matzah piece at the Seder.", answer: "What is the afikoman?", dailyDouble: false },
              { order: 4, value: 800, question: "Outside Israel (in the diaspora), Passover is observed for this many days.", answer: "What is eight days?", dailyDouble: false },
              { order: 5, value: 1000, question: "The Seder often ends with this phrase: Next year in ____.", answer: "What is Jerusalem?", dailyDouble: false },
            ],
          },
        ],
      },
    ],
    finalClue: {
      category: "Seder Songs",
      question:
        "This Seder song's title means 'it would have been enough' and thanks God for many acts of redemption.",
      answer: "What is Dayenu?",
    },
  },
];

async function seed() {
  console.log("Seeding official games...");

  for (const gameData of officialGames) {
    console.log(`  Seeding: ${gameData.title} (slug: ${gameData.slug})`);

    await prisma.$transaction(async (tx) => {
      // Upsert the game by slug
      const existing = await tx.game.findUnique({
        where: { slug: gameData.slug },
        select: { id: true },
      });

      if (existing) {
        // Delete existing rounds (cascade cleans up categories, clues)
        await tx.round.deleteMany({ where: { gameId: existing.id } });
        await tx.finalClue.deleteMany({ where: { gameId: existing.id } });

        // Update game metadata
        await tx.game.update({
          where: { id: existing.id },
          data: {
            title: gameData.title,
            description: gameData.description,
            officialVersion: gameData.officialVersion,
            visibility: "PUBLIC",
            sourceType: "OFFICIAL",
          },
        });

        // Re-create rounds
        for (const round of gameData.rounds) {
          const newRound = await tx.round.create({
            data: { gameId: existing.id, number: round.number },
          });
          for (const cat of round.categories) {
            const newCat = await tx.category.create({
              data: { roundId: newRound.id, name: cat.name, order: cat.order },
            });
            await tx.clue.createMany({
              data: cat.clues.map((c) => ({
                categoryId: newCat.id,
                order: c.order,
                value: c.value,
                question: c.question,
                answer: c.answer,
                dailyDouble: c.dailyDouble,
              })),
            });
          }
        }

        if (gameData.finalClue) {
          await tx.finalClue.create({
            data: {
              gameId: existing.id,
              category: gameData.finalClue.category,
              question: gameData.finalClue.question,
              answer: gameData.finalClue.answer,
            },
          });
        }
      } else {
        // Create new game
        const game = await tx.game.create({
          data: {
            title: gameData.title,
            description: gameData.description,
            slug: gameData.slug,
            visibility: "PUBLIC",
            sourceType: "OFFICIAL",
            officialVersion: gameData.officialVersion,
          },
        });

        for (const round of gameData.rounds) {
          const newRound = await tx.round.create({
            data: { gameId: game.id, number: round.number },
          });
          for (const cat of round.categories) {
            const newCat = await tx.category.create({
              data: { roundId: newRound.id, name: cat.name, order: cat.order },
            });
            await tx.clue.createMany({
              data: cat.clues.map((c) => ({
                categoryId: newCat.id,
                order: c.order,
                value: c.value,
                question: c.question,
                answer: c.answer,
                dailyDouble: c.dailyDouble,
              })),
            });
          }
        }

        if (gameData.finalClue) {
          await tx.finalClue.create({
            data: {
              gameId: game.id,
              category: gameData.finalClue.category,
              question: gameData.finalClue.question,
              answer: gameData.finalClue.answer,
            },
          });
        }
      }
    });

    console.log(`  Done: ${gameData.title}`);
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
