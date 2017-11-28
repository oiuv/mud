inherit ROOM;

void create()
{
	set("short", "坟墓内部");
	set("long", @LONG
你试着继续往前走，远处似乎有老鼠吱吱的叫声，但有不
是很真切。由于光线太暗你只能看到模模糊糊的东西。
LONG);  
	set("exits", ([
		"south" : __DIR__"sec2",
		"north" : __DIR__"tomb"
	]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
