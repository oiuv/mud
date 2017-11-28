//Room: beian-daokou.c

inherit ROOM;

void create ()
{
        set ("short", "北安道口");
        set ("long", @LONG
长安城自古是繁华胜地，为数代皇朝建都之地，又为盐商大贾所聚
集，殷富甲于天下。北安道口是一个四通八达的路口，东西方向通往麒
祥街，北面是长安北城门，南方有一条大路通到故皇宫的金水桥。 
LONG);
        set("exits",([//sizeof() == 4
        	"south" : __DIR__"beian-dadao",
        	"north" : __DIR__"bei-chengmen",
        	"west" : __DIR__"qixiang3",
        	"east" : __DIR__"qixiang4",
        	"southeast" : __DIR__"bingying1",
        	"southwest" : __DIR__"bingying2",
        ]));

        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
