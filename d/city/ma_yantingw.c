inherit ROOM;

void create()
{
        set("short", "马庄宴厅");
        set("long", @LONG
这里是马庄的正厅，布置的颇为优雅，丝毫没有正厅上的
严肃气氛。一张红木大桌边上有个书柜，柜里摆了各式各样的
书。几个丐帮的乞丐围聚在这里。
LONG);
        set("exits", ([
                "east"  : __DIR__"ma_zhengting",
        ]));
        set("objects", ([
		"/d/gaibang/npc/2dai" : 1,
		"/d/gaibang/npc/3dai" : 1,
		"/d/gaibang/npc/4dai" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
