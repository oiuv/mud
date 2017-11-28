//Room: yongtai-dadao4.c

inherit ROOM;

void create ()
{
        set ("short", "永泰大道");
        set ("long", @LONG
城内街道，以南北三条并行的大街，和东西的二条主街互相交错而
成。五条大街在这清朗的夜初，却见人来车往，灯火通明，别有一番热
闹。其他小街横巷，则依这些主街交错布置，井然有序。东面是一座城
隍庙。
LONG);
        set("exits",([//sizeof() == 3
        	"south" : __DIR__"yongtai-dadao5",
        	"north" : __DIR__"xian-daokou",
        	"east" :__DIR__"miao"
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
        