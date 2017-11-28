 // chengxiang.c

inherit ROOM;

void create()
{
        set("short", "沉香劈山处");
        set("long", @LONG
传说华山三圣母爱上了一个叫刘彦昌的书生，结为夫妇，其兄二郎神
反对他们结合，将她压在华山下，她的儿子沉香长大后用斧子劈开华山，
救出了母亲。旁边有一块中间裂开的大石，象用斧子劈开的一般，叫做斧
劈石。传说就是沉香劈山救母的地方。
LONG );
        set("exits", ([ /* sizeof() == 3 */
            "westup"   : __DIR__"lianhua",
            "eastdown" : __DIR__"lianpath2",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "huashan" );

        setup();
        replace_program(ROOM);
}
