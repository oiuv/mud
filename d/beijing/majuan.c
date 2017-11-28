inherit ROOM;

void create ()
{
  	set ("short", "马厩");
  	set ("long", @LONG
这是镇远镖局里的的马厩，常年供应新鲜草料。马厩修的舒适异常，而且
还有专人照顾。这里的马匹喂饱饮足，洗刷得干乾净净，平时镖局里出镖所用
到的马匹都是由这里供应的。马厩中堆放著几堆草料，正中有一口泔槽。马厩
的门前贴着一张由王剑杰亲笔书写的告示(gaoshi)。
LONG);

  	set("exits", ([
  		"west" : __DIR__"front_yard",
	]));

  	set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
		__DIR__"npc/matong": 1,
        ]));
        set("item_desc", ([
                "gaoshi": @TEXT

镇远镖局的镖师可以免费骑马至以下城市。

 扬州城:  rideyz    苏州城:  ridesz
 杭州城:  ridehz    福州城:  ridefz
 大理城:  ridedl    襄阳城:  ridexy
 永登城:  rideyd    伊犁镇:  rideyl
 佛山镇:  ridefs    峨嵋山:  rideem

TEXT]));
	setup();
	replace_program(ROOM);
}