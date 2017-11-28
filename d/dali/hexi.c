inherit ROOM;

void create()
{
        set("short", "河西镇");
        set("long", @LONG
此镇正处妃丽湖南，住的是阿藜蛮的休猎部。阿藜蛮属台
夷，村民除了耕种沿湖的田地外，主要以捕鱼为生。临湖风光
格外秀丽，北边不远就是渔船出入的小码头。南边山中有不少
野兽，休猎部的男子经常前去狩猎。
LONG);
        set("objects", ([
                __DIR__"npc/tshangfan": 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "northeast" : __DIR__"feilihueast",
                "west"      : __DIR__"yujia",
                "north"     : __DIR__"feilihusouth",
                "south"     : __DIR__"zhulin2",
        ]));
        setup();
        replace_program(ROOM);
}
