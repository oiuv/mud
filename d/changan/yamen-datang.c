//Room: yamen-datang.c

inherit ROOM;

void create ()
{
        set ("short", "长安府大堂");
        set ("long", @LONG
长安府大堂之上有一种威严之势，不由让你心惊胆颤。前方一张红
木大桌，后面坐着知府大人。上有一幅大匾，写着"廉明清正"四个烫金
大字。桌旁站立着一位老师爷。
LONG);
        set("exits", 
        ([ //sizeof() == 1
        	"north" : __DIR__"yamen",
        ]));
        set("objects", 
        ([ //sizeof() == 2
        	__DIR__"npc/zhifu" : 1,
        	__DIR__"npc/shiye" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
