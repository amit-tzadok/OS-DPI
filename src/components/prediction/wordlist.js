/**
 * Common spoken-English words, most frequent first. Weighted toward
 * conversation and AAC core vocabulary rather than written text, so that
 * short everyday words win. Used by the built-in predictors when nothing
 * better (learned words, board words, AI) is available.
 */
export const COMMON_WORDS = `
I you the a to it and that is what do my me no yes not in we be have
this can are for like go on he was want of with she they just know get
so but your there here all at if don't it's I'm can't help please more
stop now one good see how out up come they're about will would there's
think want need feel make look why when where who time some them her him
his our us from day really yeah okay ok right well then back eat drink
play home today going been did said too say very thank thanks sorry
because could had has let's let much any again love tired happy sad
hurt pain bathroom toilet water food mom dad please wait more done finish
all_done hello hi bye goodbye later tomorrow yesterday morning night
afternoon evening week weekend school work friend family people person
thing things something nothing everything anything someone somebody
nobody everybody little big lot lots other another different same new old
first last next before after over under into off down around through
always never sometimes often maybe probably still already yet only also
even way take give put tell ask talk call try use find keep turn start
show hear listen watch read write open close sit stand walk run sleep
wake wash bath shower dress clothes shoes bed room house car bus outside
inside music song game tv phone computer tablet book movie picture
breakfast lunch dinner snack hungry thirsty cold hot warm sick better
worse fine great nice bad funny scared angry mad upset excited bored
lonely calm ready busy sure true wrong real hard easy fast slow loud
quiet early late long short high low full empty clean dirty wet dry
open closed same favorite best own each every both few many most less
than which these those their its being doing having going coming getting
making taking looking feeling thinking talking playing eating drinking
sleeping working watching waiting trying saying told went came got made
took gave saw heard felt thought wanted needed liked looked asked
called tried used found kept left put started showed walked played
again away together alone enough almost already quite pretty kind sort
minute minutes hour hours today tonight now soon then once twice
Monday Tuesday Wednesday Thursday Friday Saturday Sunday
doctor nurse medicine hospital appointment teacher class therapy
brother sister son daughter husband wife grandma grandpa baby kids
dog cat pet name birthday party holiday trip store shop money buy pay
weather rain sun snow cold hot nice wind
how's what's where's who's that's he's she's we're you're I've I'll
I'd you'll won't didn't doesn't isn't aren't wasn't haven't shouldn't
couldn't wouldn't should might must may shall
mine yours ours hers myself yourself
question answer idea problem reason story news job place world life
year years month months part side end top bottom front middle
head arm leg hand foot back stomach tooth teeth eye eyes ear nose mouth
coffee tea juice milk soda pizza sandwich chicken apple cookie candy
remember forget understand mean believe hope wish guess decide
change move bring carry hold pick choose win lose miss meet visit
learn teach study write draw sing dance swim drive ride fly
cook clean fix break wear wear fit share send buy sell
`
  .trim()
  .split(/\s+/)
  .map((word) => word.replace(/_/g, " "))
  // keep the first (most frequent) occurrence of any repeats
  .filter((word, i, all) => all.indexOf(word) === i);
