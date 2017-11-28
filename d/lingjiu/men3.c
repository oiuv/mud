inherit ROOM;

void create()
{
        set("short", "闭关室大门");
        set("long", @LONG
这是闭关室南边，北面有一扇大门便是通往闭关室。那里
本是天山童姥闭关修练的地方，至天山童姥仙去之后，虚竹子
便将此处挪出，让梅兰竹菊四姐妹居住。
LONG);
        set("outdoors", "lingjiu");
        set("exits", ([
                "north" : __DIR__"biguan",
                "south" : __DIR__"xiaodao2",
        ]));
        set("objects",([
                CLASS_D("lingjiu") + "/shisao" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
