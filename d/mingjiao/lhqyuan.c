//lhqyuan.c
inherit ROOM;

void create()
{
        set("short", "大院");
        set("long", @LONG
你走进了烈火旗的大院，却发现这里人声鼎沸，烈火教众
有的在搬火药，有的在炼石油，真是热火朝天。院子左首可能
是练武场，隐约传来打斗声；右首是一座大厅，象是烈火旗的
议会场所。向上走就是光明顶明教总舵了。
LONG );
        set("exits", ([
                "west"    : __DIR__"lhqlwch",
                "northup" : __DIR__"lhqhoumen",
                "east"    : __DIR__"lhqdating",
                "out"     : __DIR__"lhqmen",
                "enter"   : __DIR__"huroom",
        ]));
        set("outdoors", "mingjiao");
        setup();
        replace_program(ROOM);
}
