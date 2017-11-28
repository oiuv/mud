inherit ROOM;

void create()
{
        set("short", "大观园茶楼");
        set("long", @LONG
大观园茶楼乃中州城内屈指可数的大茶楼，可是茶楼里却
没几个人。里面好象有个楼梯往下，微微从下面透出的味道让
人闻了头有点发昏。
LONG);
        set("exits", ([
  		"east" : __DIR__"wendingnan2",
  		"down" : __DIR__"yanguan",
	]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
