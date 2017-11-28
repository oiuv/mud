#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIG "\n\n                修        罗        道" NOR);
        set("long", HIG "\n"
"阿修罗原是印度远古诸神之一，被视为恶神，属于凶猛好斗的\n"
"鬼神，经常与帝释天争斗不休。因有福报而没有德性有的说法\n"
"只是将他纳入鬼神中，或说是堕落的天人，而北传佛教将他列\n"
"为善道，南传佛教则归类入恶道中。福如天人，德非天人。\n\n" NOR);
        setup();
}

