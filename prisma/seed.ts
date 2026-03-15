import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function isLibSqlUrl(url: string): boolean {
  return (
    url.startsWith("libsql://") ||
    url.startsWith("https://") ||
    url.startsWith("wss://")
  );
}

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = isLibSqlUrl(databaseUrl)
  ? new PrismaLibSql({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : new PrismaBetterSqlite3({
      url: databaseUrl,
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
              { order: 1, value: 200, question: "This planet is known as the Red Planet.", answer: "What is Mars?" },
              { order: 2, value: 400, question: "This element has the chemical symbol 'O'.", answer: "What is Oxygen?" },
              { order: 3, value: 600, question: "This force keeps us on the ground.", answer: "What is gravity?" },
              { order: 4, value: 800, question: "This organ pumps blood through the human body.", answer: "What is the heart?" },
              { order: 5, value: 1000, question: "This scientist developed the theory of general relativity.", answer: "Who is Albert Einstein?" },
            ],
          },
          {
            name: "U.S. History",
            order: 1,
            clues: [
              { order: 1, value: 200, question: "This document declared independence from Britain in 1776.", answer: "What is the Declaration of Independence?" },
              { order: 2, value: 400, question: "This president issued the Emancipation Proclamation.", answer: "Who is Abraham Lincoln?" },
              { order: 3, value: 600, question: "This war was fought between the North and South from 1861-1865.", answer: "What is the Civil War?" },
              { order: 4, value: 800, question: "This amendment gave women the right to vote.", answer: "What is the 19th Amendment?" },
              { order: 5, value: 1000, question: "This event on December 7, 1941 brought the U.S. into WWII.", answer: "What is the attack on Pearl Harbor?" },
            ],
          },
          {
            name: "Geography",
            order: 2,
            clues: [
              { order: 1, value: 200, question: "This is the largest ocean on Earth.", answer: "What is the Pacific Ocean?" },
              { order: 2, value: 400, question: "This country has the largest population in the world.", answer: "What is India?" },
              { order: 3, value: 600, question: "This is the longest river in Africa.", answer: "What is the Nile?" },
              { order: 4, value: 800, question: "This mountain is the tallest in the world.", answer: "What is Mount Everest?" },
              { order: 5, value: 1000, question: "This desert is the largest hot desert in the world.", answer: "What is the Sahara?" },
            ],
          },
          {
            name: "Pop Culture",
            order: 3,
            clues: [
              { order: 1, value: 200, question: "This wizard attends Hogwarts School of Witchcraft and Wizardry.", answer: "Who is Harry Potter?" },
              { order: 2, value: 400, question: "This superhero is also known as the Man of Steel.", answer: "Who is Superman?" },
              { order: 3, value: 600, question: "This animated film features a clownfish named Marlin searching for his son.", answer: "What is Finding Nemo?" },
              { order: 4, value: 800, question: "This band sang 'Bohemian Rhapsody'.", answer: "Who is Queen?" },
              { order: 5, value: 1000, question: "This TV show features dragons and the Iron Throne.", answer: "What is Game of Thrones?" },
            ],
          },
          {
            name: "Food & Drink",
            order: 4,
            clues: [
              { order: 1, value: 200, question: "This Italian dish is made with flat pasta sheets, meat sauce, and cheese.", answer: "What is lasagna?" },
              { order: 2, value: 400, question: "This fruit is the main ingredient in guacamole.", answer: "What is an avocado?" },
              { order: 3, value: 600, question: "This country is famous for sushi and ramen.", answer: "What is Japan?" },
              { order: 4, value: 800, question: "This spice gives curry its yellow color.", answer: "What is turmeric?" },
              { order: 5, value: 1000, question: "This French pastry is made of choux dough and filled with cream.", answer: "What is an eclair?" },
            ],
          },
          {
            name: "Sports",
            order: 5,
            clues: [
              { order: 1, value: 200, question: "This sport uses a round orange ball and a hoop.", answer: "What is basketball?" },
              { order: 2, value: 400, question: "This country has won the most FIFA World Cup titles.", answer: "What is Brazil?" },
              { order: 3, value: 600, question: "This tennis Grand Slam is played on grass courts.", answer: "What is Wimbledon?" },
              { order: 4, value: 800, question: "This boxer was known as 'The Greatest' and could 'float like a butterfly'.", answer: "Who is Muhammad Ali?" },
              { order: 5, value: 1000, question: "This event is held every four years and features athletes from around the world.", answer: "What are the Olympic Games?" },
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
              { order: 1, value: 200, question: "This bitter herb, often horseradish, represents the bitterness of slavery in Egypt.", answer: "What is maror?" },
              { order: 2, value: 400, question: "This sweet fruit-and-nut mixture symbolizes the mortar used by Hebrew slaves.", answer: "What is charoset?" },
              { order: 3, value: 600, question: "This roasted item on the Seder plate symbolizes the Passover sacrifice in Temple times.", answer: "What is the zeroa (shank bone)?" },
              { order: 4, value: 800, question: "This vegetable is dipped in salt water early in the Seder.", answer: "What is karpas?" },
              { order: 5, value: 1000, question: "This egg on the Seder plate symbolizes the festival offering and mourning for the destroyed Temple.", answer: "What is a beitzah (egg)?" },
            ],
          },
          {
            name: "Seder Order",
            order: 1,
            clues: [
              { order: 1, value: 200, question: "The Hebrew word for the ritual Passover meal literally means this.", answer: "What is order?" },
              { order: 2, value: 400, question: "Kadesh is this numbered step in the traditional 15-step Seder order.", answer: "What is the first step?" },
              { order: 3, value: 600, question: "This section of the Seder is when the Exodus story is told.", answer: "What is Maggid?" },
              { order: 4, value: 800, question: "The hidden afikoman is eaten during this Seder step.", answer: "What is Tzafun?" },
              { order: 5, value: 1000, question: "This late Seder section includes songs of praise such as Hallel.", answer: "What is Hallel?" },
            ],
          },
          {
            name: "Four Questions & Cups",
            order: 2,
            clues: [
              { order: 1, value: 200, question: "Traditionally, this person asks or sings the Four Questions (Ma Nishtanah).", answer: "Who is the youngest child?" },
              { order: 2, value: 400, question: "This many cups of wine or grape juice are drunk during the Seder.", answer: "What is four?" },
              { order: 3, value: 600, question: "One Four Question asks why, on this night, we dip foods this many times.", answer: "What is two?" },
              { order: 4, value: 800, question: "Another Four Question asks why, on this night, we eat only this bread and not chametz.", answer: "What is matzah?" },
              { order: 5, value: 1000, question: "When drinking the four cups, many participants recline to this side as a symbol of freedom.", answer: "What is the left side?" },
            ],
          },
          {
            name: "Ten Plagues",
            order: 3,
            clues: [
              { order: 1, value: 200, question: "The first plague turned the Nile River into this.", answer: "What is blood?" },
              { order: 2, value: 400, question: "This plague came right after blood in the traditional order.", answer: "What are frogs?" },
              { order: 3, value: 600, question: "This tiny pest is usually listed as the third plague.", answer: "What are lice?" },
              { order: 4, value: 800, question: "The ninth plague, choshech, is translated as this.", answer: "What is darkness?" },
              { order: 5, value: 1000, question: "The tenth and final plague was the death of these in Egypt.", answer: "Who are the firstborn?" },
            ],
          },
          {
            name: "Exodus Story",
            order: 4,
            clues: [
              { order: 1, value: 200, question: "This prophet confronted Pharaoh and led the Israelites out of Egypt.", answer: "Who is Moses?" },
              { order: 2, value: 400, question: "Fill in the famous demand to Pharaoh: Let my people ____.", answer: "What is go?" },
              { order: 3, value: 600, question: "After leaving Egypt, the Israelites crossed this sea.", answer: "What is the Red Sea (Sea of Reeds)?" },
              { order: 4, value: 800, question: "Passover begins on the 15th of this Hebrew month.", answer: "What is Nisan?" },
              { order: 5, value: 1000, question: "The Torah command linked to Passover says to eat matzah for this many days in Israel.", answer: "What is seven days?" },
            ],
          },
          {
            name: "Passover Traditions",
            order: 5,
            clues: [
              { order: 1, value: 200, question: "Leavened food removed from Jewish homes before Passover is called this.", answer: "What is chametz?" },
              { order: 2, value: 400, question: "A special cup is poured for this prophet during the Seder.", answer: "Who is Elijah?" },
              { order: 3, value: 600, question: "Children often search for this hidden matzah piece at the Seder.", answer: "What is the afikoman?" },
              { order: 4, value: 800, question: "Outside Israel (in the diaspora), Passover is observed for this many days.", answer: "What is eight days?" },
              { order: 5, value: 1000, question: "The Seder often ends with this phrase: Next year in ____.", answer: "What is Jerusalem?" },
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
  {
    slug: "jens-2026-passover-jeopardy",
    title: "Jen's 2026 Passover Jeopardy",
    description: "A custom Passover game created for Jen's 2026 seder.",
    officialVersion: 1,
    rounds: [
      {
        number: 1,
        categories: [
          {
            name: "FOODS OF THE SEDER",
            order: 0,
            clues: [
              { order: 1, value: 100, question: "While a great bagel needs at least 24 hours for the dough to ferment, this can not ferment for more than eighteen minutes.", answer: "What is matzah?" },
              { order: 2, value: 200, question: "This dish is often referred to as Jewish penicillin.", answer: "What is matzah ball soup?" },
              { order: 3, value: 300, question: "A Bloody Mary just wouldn't taste right without this.", answer: "What is horseradish?" },
              { order: 4, value: 400, question: "This Cincinnati rabbi, in 1888, founded a company that cornered the Passover food market.", answer: "Who is Manischewitz?" },
              { order: 5, value: 500, question: "Food historians claim this food first showed up either in a convent in France in 791 or in Italian monasteries around the 9th century.", answer: "What is a macaroon?" },
            ],
          },
          {
            name: "STORIES IN THE HAGGADAH",
            order: 1,
            clues: [
              { order: 1, value: 100, question: "Vermin infestation and losing drinkable water were not enough for this man to decide that hating people who are different from him had too high a cost.", answer: "Who is Pharaoh?" },
              { order: 2, value: 200, question: "You can set all the extra cups of wine as you want on the table; this man will not be joining your Seder.", answer: "Who is Elijah?" },
              { order: 3, value: 300, question: "\"If he had saved us from our pursuers but had not fed us manna in the desert.\" Although this is not a sentiment I have ever expressed, it is the core part of this song.", answer: "What is “It would have been enough (or dayenu?)" },
              { order: 4, value: 400, question: "If not for these two women outwitting Pharaoh's order to kill all the Hebrew baby boys, there would be no Moses.", answer: "Who are the midwives, Shifra and Puah?" },
              { order: 5, value: 500, question: "You can be off the grid, minding your own business, staying off social media, perhaps tending a flock of sheep, when the demands of the moment will come and find you. This is what it took to bring Moses back.", answer: "What is the burning bush?" },
            ],
          },
          {
            name: "TEN PLAGUES",
            order: 2,
            clues: [
              { order: 1, value: 100, question: "Whether it is pea-sized, quarter-sized or golf ball-sized, you don't want this hitting your window.", answer: "What is hail?" },
              { order: 2, value: 200, question: "Every single member of the Trump administration has this all over their hands.", answer: "What is blood?" },
              { order: 3, value: 300, question: "For a hundred dollars an hour plus travel fees, a trained professional will come to your home to remove these.", answer: "What are lice?" },
              { order: 4, value: 400, question: "This is the common way to describe Bovine Spongiform Encephalopathy, caused by the protein molecule prion.", answer: "What is mad cow disease?" },
              { order: 5, value: 500, question: "If the Egyptians just used a hot compress or turmeric powder, they could have gotten rid of this.", answer: "What is a boil?" },
            ],
          },
          {
            name: "ACTIVISTS AND REBELS",
            order: 3,
            clues: [
              { order: 1, value: 100, question: "Born into slavery, this journalist led an anti-lynching campaign.", answer: "Who is Ida B. Wells?" },
              { order: 2, value: 200, question: " Collectively, they are fighting for the soul of our country.", answer: "Who are the people of Minneapolis?" },
              { order: 3, value: 300, question: "There is a legend that the Red Sea did not split until someone named Nachshon did something very brave.", answer: "What is walk into the water?" },
              { order: 4, value: 400, question: "Who said this– 'For many of us, the march from Selma to Montgomery was about protest and prayer. Legs are not lips, and walking is not kneeling. And yet our legs uttered songs. Even without words, our march was worship. I felt my legs were praying", answer: "Who is Rabbi Heschel?" },
              { order: 5, value: 500, question: "Arthur Liu, Alysa Liu's father, was part of the protest in this square that made him a political refugee.", answer: "What is Tiananmen Square?" },
            ],
          },
          {
            name: "PASSOVER RHYMES",
            order: 4,
            clues: [
              { order: 1, value: 100, question: "Inside the Egyptian ruler's bones.", answer: "What is Pharaoh's marrow?" },
              { order: 2, value: 200, question: "This is the spell a magician says to pull bugs out of a hat.", answer: "What is hocus pocus locust? (I will allow hocus locust)" },
              { order: 3, value: 300, question: "A mosaic of a great river.", answer: "What is a tile Nile?" },
              { order: 4, value: 400, question: "These pups came out of the womb with a score to settle.", answer: "What is a bitter litter?" },
              { order: 5, value: 500, question: "When you like your in-laws' Passover dinner better than your mom's.", answer: "What is a Seder traitor?" },
            ],
          },
        ],
      },
    ],
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

