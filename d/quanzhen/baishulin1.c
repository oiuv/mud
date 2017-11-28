inherit ROOM;

void create()
{
        set("short", "柏树林");
        set("long", @LONG
绕过翠屏谷的山壁，眼前是一片大柏树林，想是由于山壁
挡住了视线，在山下的山路上根本想不到这里的柏树竟会有这
么密这么高。你踏进柏树林中，阳光全被头顶的树叶遮住，越
往树林深处，光线越是幽暗。
LONG);
        set("outdoors", "quanzhen");
        set("exits", ([
                "southdown" : __DIR__"cuipinggu",
                "northup" : __DIR__"baishulin3",
                "east" : __DIR__"baishulin2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
