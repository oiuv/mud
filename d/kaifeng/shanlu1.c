inherit ROOM;

void create ()
{
	set ("short", "山路");
  	set ("long", @LONG
这是一条黄土飞扬的山路，因为离嵩山等几处山脉还比较
远，所以它很是宽阔，路上来往人很多，路边相隔不远就有个
小亭子供行人歇脚，向南去不远就是开封城。由北而上直通嵩
山，由此前住嵩山进香、游玩的客人络绎不绝。
LONG);

  	set("outdoors", "kaifeng");
  	set("exits", ([
  		"eastdown" : __DIR__"jiaowai",
  		"westdown" : __DIR__"shanlu2",
	]));

  	setup();
        replace_program(ROOM);
}
