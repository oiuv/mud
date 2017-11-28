inherit ROOM;

void create()
{
	set("short", "小巷");
	set("long", @LONG
洛阳东城的一条由碎石铺砌的小巷，非常僻静。刚下过雨，路面看起
来还满干净的。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"suishi4",
  		"north" : __DIR__"xiaoxiang4",
	]));

	setup();
	replace_program(ROOM);
}
