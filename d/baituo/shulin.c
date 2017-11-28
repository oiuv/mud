inherit ROOM;

void create()
{
        set("short", "树林");
        set("long", @LONG
这里是一片茂密的树林，翠绿色的树阴遮盖着天空，偶尔
还从林子深处传来几声不知什么野兽的嘶叫。
LONG);
        set("outdoors", "baituo");
        set("exits", ([
                "west"  : __DIR__"shulin1",
                "south" : __DIR__"shanlu1",
        ]));
        set("quarrys", ([
                "tu"         : 100000,
                "ji"         : 80000,
                "pao"        : 50000,
                "caihuashe"  : 50000,
                "dushe"      : 20000,
                "hu"         : 5000,
                "bao"        : 2000,
                "laohu"      : 2000,
        ]));
 	setup();
 	replace_program(ROOM);
}

