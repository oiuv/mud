inherit ROOM;

int do_knock(string arg);

void create()
{
        set("short", "刘府大院");
        set("long", @LONG
刘府大院里现在挤着很多江湖豪客，原来今天是刘正风金
盆洗手的好日子。刘老爷子在衡阳人缘很好，来捧场的自然不
少，大院里已摆了很多张桌子，杯筷往来，很是热闹。但见他
们一个个都神情异常，今天这里像是出了什么事情。
LONG);
        set("exits", ([
               "north"  : __DIR__"liufudating",
               "out"    : __DIR__"liufugate",
        ]));

        set("objects", ([
                __DIR__"npc/dao-ke"  : 2,
                __DIR__"npc/jian-ke" : 4,
                __DIR__"npc/haoke"   : 2,
        ]));

        setup();
	replace_program(ROOM);
}
