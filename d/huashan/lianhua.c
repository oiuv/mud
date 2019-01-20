// Room: /d/huashan/lianhua.c
// Modify by Rcwiz for hero.cd

inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "莲花峰");
        set("long", @LONG
太华西峰－又名莲花峰，也叫芙蓉峰，峰顶有一块巨石，状如莲花，覆盖
崖巅。该处由此得名。这里悬崖陡峭，壁立千仞，登临远眺（tiao），秦川莽
莽，渭、洛二水盘屈如带。峰顶有石名“摘星石”，取“手可摘星辰”之意，
以状西峰之高。
LONG
        );
        set("exits", ([ /* sizeof() == 4 */
             "eastdown" : __DIR__"chengxiang",
        ]));

        set("item_desc", ([
               "jianzhong" : "太远了瞧不清楚。\n",
        ]));

        set("outdoors", "huashan");

        setup();
}
 
void init()
{
        object me = this_player();
        if (me->query_temp("xunshan")) me->set_temp("xunshan/lianhua", 1);

        add_action("do_tiao", "tiao");
        add_action("do_jump", "jump");

        return;
}

int do_tiao()
{
//      object me = this_player();

        write(@LONG
但见远处峭壁如一座极大的屏风，冲天而起，峭壁中部离地约二十馀丈处，生
著一块三四丈见方的大石，便似一个平台，石上隐隐刻得有字。极目上望，瞧
清楚乃是「剑冢」（jianzhong）两个大字。
LONG);

        return 1;
}

int do_jump(string arg)
{
        object me = this_player();

        if (! arg || arg != "jianzhong")
             return notify_fail("你要往哪儿跳？\n");

        if (me->query("qi") < 300)
             return notify_fail("你力气不加。\n");

        if (me->is_busy() || me->is_fighting())
             return notify_fail("等你忙完了再说。\n");

        me->start_busy(1 + random(3));

        if (me->query_skill("dodge", 1) < 200 || me->query_str() < 30)
        {
             message_vision(HIG "$N" HIG "提一口气，窜高数尺，往莲花峰上峭壁跳去 ……\n"
                            HIR "$N" HIR "爬了十来丈，已然力气不加，当即摔了下来，浑身鲜血直流。\n" NOR, me);
   
             me->receive_wound("qi", me->query("qi") / 2, me);        
            
             return 1;
        }

        message_sort(HIG "\n$N" HIG "纵身跃起，窜高数尺，左足踏在峭壁上的小洞之中，跟"
                     "着窜起，右足对准一丛青苔踢了进去，软泥迸出，石壁上竟然又有一个"
                     "小穴可以容足，$N" HIG "深吸一口气，双臂抓住石壁上突出的石块，猛地"
                     "用力一跃，跳上了峭壁。\n" NOR, me);

       me->move(__DIR__"jianzhong");
      
       return 1;
}
