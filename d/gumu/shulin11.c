
inherit ROOM;

void create()
{
        set("short", "树林");
        set("long", @LONG
这位於终南山间的一大片树林，生的颇为茂密。走在其间，
只听得脚下沙沙的落叶声，四周昏昏暗暗的，不时几道日光穿
过浓密的枝头，投射而下。偶而远处几声兽吼声，更添了一份
神密感。往北、南各有一条小径。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "south"     : __DIR__"shulin10",
                "northdown" : __DIR__"shulin12",
        ]));
        setup();
        replace_program(ROOM);
}
