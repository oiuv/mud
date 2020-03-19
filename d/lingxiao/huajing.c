inherit ROOM;

void create()
{
        set("short", "花径");
        set("long", @LONG 
这是一条种满了各色梅花的花径。小径两边梅花飘香，梅
萼生寒。悠然而赏鉴，梅枝蜿蜒，梅干崎岖，古朴飘逸，兼而
有之。梅枝干以枯残丑拙为贵，梅花梅萼以繁密浓聚为尚，此
处之景，可谓得矣。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"east"  : __DIR__"qianyuan",
            	"up"  : __DIR__"feihua",  
        ]));
        set("objects", ([
               "/clone/quarry/he2" : 1,
               __DIR__"obj/mei" : 4,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);

}

