inherit ROOM;

void create()
{
        set("short", "峭壁");
        set("long", @LONG
你走到这里，发现前面已经没有路了。你面前是一座立陡的山峰，高耸
入云，看不到尽头。石壁上生长着很多松树，疾风吹来，沙沙作响。
LONG    );
        set("exits", ([
                "southwest" : __DIR__"shangu-2",
                "northup" : __DIR__"szfeng",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "tiezhang");
        setup();
}