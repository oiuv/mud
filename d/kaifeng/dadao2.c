inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
一条斜斜的小路，向西去不远有片树林，看上去黑呼呼的
自从不久前树林中出了野猪伤人后，这条道就少人走。只有贪
图路近的人还走这条道。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"southwest" : __DIR__"yezhulin",
  		"northeast" : __DIR__"dadao1",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
