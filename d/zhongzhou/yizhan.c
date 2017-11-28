inherit ROOM;

void create()
{
        set("short", "驿站");
        set("long", @LONG
这里是中州城的驿站，这个驿站不大，一边是个小小的草
蓬，几个官差在此落脚。
LONG);

        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"wendingnan4",
	]));

        setup();
        replace_program(ROOM);
}
