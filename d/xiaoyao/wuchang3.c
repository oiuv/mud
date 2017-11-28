inherit ROOM;

void create()
{
        set("short", "逍遥场");
        set("long", @LONG
这是里没有多余的摆设，只是立着些练功用的木人，但年
久失修，早已损坏得差不多了。看来这里是供给逍遥派弟子练
功用的场所。
LONG);
        set("exits", ([
                "south" : __DIR__"wuchang1",
        ]));

        set("outdoors", "xiaoyao");
        set("for_family", "逍遥派");
        setup();
        replace_program(ROOM);
}
