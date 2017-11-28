inherit ROOM;
void create()
{
        set("short", "河洛镖局");
        set("long", @LONG
一座建构宏伟的宅第之前，左右两座石坛中各竖一根两丈来高的旗
杆，旗杆顶飘扬青旗。右首旗上黄色丝线绣著一头张牙舞爪、神态威猛
的金龙，旗子随风招展，显得金龙更奕奕若生。左首旗上绣著「河洛镖
局」四个黑字，银钩铁划，刚劲非凡。进门处两排长凳，分坐著八名劲
装结束的汉子，个个腰板笔挺，显出一股英悍之气。
LONG);
        set("exits", ([
        	"north" : __DIR__"qixiang5",
        	"south" : __DIR__"biaoju-dayuan",
        ]));
        set("objects", ([
        	__DIR__"npc/biaoshi" : 1,
        	__DIR__"npc/tang" : 2,
        ]) );

        setup();
        replace_program(ROOM);
}
