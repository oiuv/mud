inherit ROOM;
void create()
{
  	set ("short", "延陵西路");
  	set ("long", @LONG
这里就是延陵东路，是中州的一条老街。两边的房屋看上
去已经很陈旧了。街道上冷冷清清的，偶尔一两个人路过。再
往前走，就能隐隐的看见中州的西城楼了。路北面有间杂货铺
开在这偏僻的地方，估计生意不会太好。
LONG);

	set("outdoors", "zhongzhou");

  	set("exits", ([  
    		"west" : __DIR__"yanling2",
    		"north" : __DIR__"zahuopu",
    		"east"  : __DIR__"yanling",
	]));
        set("objects",([
                __DIR__"npc/fushang":1,
                __DIR__"npc/poorman":1,
        ]));
       
        setup();
        replace_program(ROOM);
}
