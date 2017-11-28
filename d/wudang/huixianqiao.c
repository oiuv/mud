inherit ROOM;

void create()
{
        set("short", "会仙桥");
        set("long", @LONG
这里地势稍平，一道山涧缓缓流过，一座窄窄的木桥横在
涧上，只溶一人经过。
LONG);
        set("exits", ([
                "north" : __DIR__"chaotiangong",
                "south" : __DIR__"toutiangate",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}