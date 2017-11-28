//Room: baoxiangsi.c

inherit ROOM;

void create ()
{
        set ("short", "宝象寺");
        set ("long", @LONG
宝象寺规模宏大，房舍近千，别院处处。放眼所见，这里尽是高阁
石壁，佛彩龙像，绕不一会，已然分不清来时的道路。但见那一尊尊的
石刻似乎都裂著嘴在向你嘿嘿而笑，
LONG);
        set("exits", 
        ([ //sizeof() == 2
        	"north" : __DIR__"qinglong1",
        	"south" : __DIR__"baodian",
        ]));
        set("objects", 
        ([ //sizeof() == 2
        	__DIR__"npc/monk" : 2,
        ]));

        setup();
	replace_program(ROOM);
}
