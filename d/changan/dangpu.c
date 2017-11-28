//Room: dangpu.c

inherit ROOM;

void create ()
{
        set ("short", "萧记当铺");
        set ("long", @LONG
这是长安城里最大的一家当铺了。素来以买卖公平著称。门口挂了
一块牌子 (paizi)。一个三尺高的柜台挡在你的面前，柜台后坐着掌柜
的冯老板，见你走了进来，一双精明的眼睛上上下下打量着你。
LONG);
        set("exits", ([ /* sizeof() == 1 */
        	"north" : __DIR__"qixiang3",
        ]));
        set("item_desc", ([ /* sizeof() == 1 */
        	"paizi" : "
本当铺财力雄厚，童叟无欺，欢迎惠顾。
客官可以在这里：
           ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
          ＊	卖断(sell)		＊
          ＊	估价(value)		＊
          ＊	购买(buy) 用list查看。	＊
           ＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
各种货物，铜钱、银两、黄金、银票一概通用。\n"
        ]));
        set("objects", ([ /* sizeof() == 1 */
        	__DIR__"npc/wanxi" : 1,
        ]));

        set("no_fight", 1);
        setup();
        replace_program(ROOM);
}
