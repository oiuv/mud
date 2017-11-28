inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
这里是一条上山的小路。山路周围很是僻静，连个人影也
没有。往西南是东街，东北处是一块坟地。
LONG);
        set("outdoors", "baituo");
        set("exits", ([
                "northup"   : __DIR__"xiaolu2",
                "southwest" : __DIR__"dongjie",
                "northeast" : __DIR__"fende",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
