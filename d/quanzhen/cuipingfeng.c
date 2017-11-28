inherit ROOM;

void create()
{
        set("short", "翠屏峰顶");
        set("long", @LONG
这里是翠屏峰的峰顶。翠屏峰是终南山的第一峰，也是最
矮的一个山峰。悬崖边建有一个小亭子，你走进亭中凭拦远望，
远处的山间白云漂浮缭绕，好象筑着什么建筑，山景清丽，可
惜被白云尽遮住了。几个游客也在亭中歇脚。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "southdown" : __DIR__"baishulin3",
        ]));
        set("objects",([
                __DIR__"npc/youke" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
