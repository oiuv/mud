inherit ROOM;

void create()
{
        set("short", "林间小道");
        set("long", @LONG
这是一条长长的林间小道，从东边一直通到西边，一眼望
去，看不到路的尽头。两旁百花争艳。令人留连忘返。南北有
条小径，不断有逍遥派的弟子往来，隐隐还传来阵阵的打斗叫
喝声。
LONG);
        set("exits", ([
                "east" : __DIR__"qingcaop",
                "west" : __DIR__"xiaodao2",
                "north" : __DIR__"wuchang1",
                "south" : __DIR__"wuchang2",
        ]));
        set("objects", ([
                CLASS_D("xiaoyao") + "/fanbail" : 1,
        ]));
        set("outdoors", "xiaoyao");
        setup();
}

