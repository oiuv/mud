inherit ROOM; 
 
void create ()
{
  	set ("short", "客房");
  	set ("long", @LONG
镖局里的人把他们的来客招待的周到无比，把房间布置的非常舒适。红木
桌上沏了一壶好茶，摆着几盘点心。屋角香炉里传来一阵阵清香。一张宽大柔
软的床上铺着被褥，让人不觉昏昏欲睡。
LONG);

  	set("exits", ([
  		"east" : __DIR__"front_yard2",
	]));

        set("no_fight", 1);
        set("no_steal", 1);
        set("sleep_room", 1);
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
} 
