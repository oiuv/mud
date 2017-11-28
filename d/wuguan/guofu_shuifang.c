inherit ROOM;

void create()
{
    set("short", "水房");
    set("long", @LONG
一进屋，你看见屋内放着几口大缸，好象是装水用的，不
过缸似乎都是空的，这里没有一个人，估计仆人都跑了。
LONG);
        set("no_fight", 1);
        set("exits", ([
             	"east" : __DIR__"guofu_houyuan",
        ]) );
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
