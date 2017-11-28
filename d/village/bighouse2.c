// Room: /d/village/bighouse2.c

inherit ROOM;

void create()
{
        set("short", "内室");
	set("long", @LONG
这里是一间寝室，屋子中间有一张大床，床上的被褥居然是绸缎的，
看来这个土财主对自己并不是十分刻薄。屋里摆着几只木箱子，墙角里有
一只大柜子(cabinet)。
LONG );
        set("exits", ([ /* sizeof() == 1 */
            "west" :"/d/village/bighouse1",
        ]));

        setup();
        replace_program(ROOM);
}
 
