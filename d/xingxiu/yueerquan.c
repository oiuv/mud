inherit ROOM;

void create()
{
        set("short", "月儿泉");
        set("long", @LONG
出乎你的意料之外，在沙漠中竟然有泉水。一泓清澈的泉
水形成一个月牙的形状，因而得名月儿泉。南面是一片峭壁东
边传来嗡嗡的声响。
LONG );
        set("resource/water", 1);
        set("exits", ([
                "east" : __DIR__"shashan",
                "enter" : __DIR__"mogaoku",
        ]));
        set("no_clean_up", 0);
        setup();
}