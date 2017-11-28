inherit ROOM;

void create()
{
        set("short", "偏厅");
        set("long", @LONG
偏厅布置的颇为优雅，丝毫没有正厅上的严肃气氛。一张
红木大桌边上有个书柜，柜里摆了各式各样的书。墙上挂着几
幅字画。看来客人少时，这里又可以当书房用。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_zoulang2",
	]));
        setup();
        replace_program(ROOM);
}
