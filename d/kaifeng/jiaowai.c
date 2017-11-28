inherit ROOM;

void create ()
{
  	set ("short","郊外");
  	set ("long", @LONG
此处是开封北郊，由于离开封很近，治安相对稳定，由此
去嵩山进香的客人络绎不绝，一幅太平景象。
LONG);
  	set("outdoors", "kaifeng");
  	set("exits", ([
  		"south" : __DIR__"xuandemen",
  		"westup" : __DIR__"shanlu1",
	]));
  	setup();
        replace_program(ROOM);
}
