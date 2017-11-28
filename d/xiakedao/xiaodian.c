// Room: /d/xiakedao/xiaodian.c
// xiao dian in xiakedao
// YZC 1995/12/04
// arnzh 97/1/24
inherit ROOM;

void create()
{
        set("short", "小吃店");
        set("long", @LONG
这个小吃店布置简易，空空的石壁什么也没有，但生意却很好。
顾客多是匆匆的江湖人，买点包子、鸡腿、米酒就赶路去了。
LONG );
        set("exits", ([
                "west" : __DIR__"yingbin",
        ]));
        set("objects", ([
                __DIR__"npc/xiaoer2" : 1,
        ]));
        setup();
        replace_program(ROOM);
}

