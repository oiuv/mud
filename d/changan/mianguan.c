//Room: mianguan.c

inherit ROOM;

void create ()
{
        set ("short", "面馆");
        set ("long", @LONG
据说这面馆十几年前就在这里了，而且不论刮风下雨，不论过年过
节，这面馆从未休息过一天。所以城里的夜游神都放心得很，因为就算
回家老婆不开门，至少还可以在老张的面馆里吃上一碗热气腾腾的牛肉
面。
LONG);
        //set("item_desc", ([" *** " : " *** ", ]));
        set("exits", 
        ([ //sizeof() == 1
        	"south" : __DIR__"huarui2",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/laozhang" : 1,
        ]));

	set("no_clean_up", 0);
        setup();
	replace_program(ROOM);
}
