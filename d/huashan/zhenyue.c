// zhenyue.c

inherit ROOM;

void create()
{
        set("short", "镇岳宫");
	set("long", @LONG
镇岳宫倚壁而构，四边松林蔽日，景色幽美。宫前有玉井(jing)，相
传井中曾生千叶白莲。这里地势略为平坦，上、下山的游客多在此稍作休
息再继续前行。附近有几间简陋的旅社，欲登东峰观日出者，大都于头晚
歇息于此。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "northdown"  : __DIR__"jinsuo",
            "eastup"     : __DIR__"yunu",
            "southwest"  : __DIR__"lianpath1",
        ]));

        set("item_desc", ([
            "jing" : "井中水色碧透，掬手可饮。\n",
        ]));

        set("outdoors", "huashan" );
        set("resource/water", 1);

        setup();
        replace_program(ROOM);
}
