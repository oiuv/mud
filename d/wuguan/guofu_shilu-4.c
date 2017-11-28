inherit ROOM;

void create()
{
        set("short", "石板路");
        set("long", @LONG
你走在一条石板路上，北面过去就是后院了，南面是西练
功场，西面传来阵阵饭菜的香气，那里是郭府的饭厅。东面过
去是郭府大厅。
LONG);
        set("no_fight", 1);
        set("exits", ([
          	"east" : __DIR__"guofu_shilu-2",
          	"south" : __DIR__"guofu_lang3",
          	"north" : __DIR__"guofu_shilu-3",
          	"west" : __DIR__"guofu_fanting",
        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
