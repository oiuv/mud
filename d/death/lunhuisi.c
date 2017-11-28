#include <ansi.h>
#include <room.h>
inherit ROOM;

void check_trigger();
void close_passage();
void reset();

void create()
{
        set("short", HIB "【轮回司】" NOR);
        set("long", HIB @LONG

                    轮         回         司

    轮回司内寒气森森，青石铺设的地面满是灰尘。堂周青布围幔，围幔
上用金银丝线绣着些奇怪的图案，正堂上一张青石桌案 (table)，桌案上
布满了蛛网，看样子很久没打扫过了。

LONG NOR );

        set("item_desc", ([
                "table" : WHT "一个青石制成的桌案，上面有几许"
                          "裂缝，看样子已搁在这里很久了。\n" NOR,
        ]));

        set("exits", ([
                "out" : __DIR__"lunhuisi_road1",
        ]));

        create_door("out", YEL "铜门" NOR, "enter", DOOR_CLOSED);
        setup();
}

void init()
{
        add_action("do_turn", "turn");
        add_action("do_say", "say");
        add_action("do_move", "move");
        add_action("do_move", "push");
        add_action("do_move", "pull");
}

int do_move(string arg)
{
        string dir;

        if( ! arg || arg == "" ) return 0;

        if( arg == "table" )
        {
                write(HIY "\n你用尽了全身力气想移动石桌，可是它犹如在地面"
                      "生根一般，纹丝不动。\n" NOR);
                return 1;
        }
}

void check_trigger()
{
        object room;

        if( (int)query("zuo") == 3
        && (int)query("you") == 3
        && ! query("exits/down") )
        {
                message("vision", WHT "\n石桌忽然「轧轧轧」一阵响动，向"
                                  "一侧缓缓移开，石桌下豁然露出一个黑"
                                  "洞洞的阶梯。\n" NOR, this_object() );
                set("exits/down", __DIR__"diyin_road1");
                delete("zuo");
                delete("you");
                remove_call_out("close_passage");
                call_out("close_passage", 10);
        }
}

void close_passage()
{
        object room;

        if( ! query("exits/down") ) return;
        message("vision", WHT "\n石桌忽然「轧轧轧」一阵响动，缓缓地移回"
                          "原处，将向下的阶梯盖了个严实。\n" NOR,
                          this_object() );
        delete("exits/down");
}


int do_turn(string arg)
{
        string dir;

        if( !arg || arg=="" ) return 0;

        if( arg == "lunpan" && (int)query("poem_said") == 1 )
        {
                write(HIC "你试着触动轮盘，发现它可以左右转动。\n" NOR);
                return 1;
        }

        if( sscanf(arg, "lunpan %s", dir) == 1 && (int)query("poem_said") == 1 )
        {
                if( dir == "left" )
                {
                        message_vision(HIW "$N" HIW "将轮盘向左转动了一圈"
                                       "……忽然「喀喀喀」几声轻响，轮盘又"
                                       "转了回原位。\n" NOR, this_player());
                        add("zuo", 1);
                        check_trigger();
                        return 1;
                }
                if( dir == "right" )
                {
                        message_vision(HIR "$N" HIR "将轮盘向右转动了一圈"
                                       "……忽然「喀喀喀」几声轻响，轮盘又"
                                       "转了回原位。\n" NOR, this_player());
                        add("you", 1);
                        check_trigger();
                        return 1;
                }
           else {
                        write(HIC "你要将轮盘向着哪个方向转动？\n" NOR);
                        return 1;
                }
        }
}

int do_say(string arg)
{
        string dir;

        if( ! arg || arg == "" ) return 0;

        if( arg == "天地崩裂时" && (int)query("poem_said") != 1 )
        {
                message_vision(HIW "\n只听$N" HIW "猛然高声喝道：“天地崩"
                               "裂时！”\n" NOR + HIR "\n$N" HIR "话音刚"
                               "落，地面突然「轰隆隆」晃动了几下。青石桌案"
                               "表层的石屑登时脱落，露出了一个石盘。\n\n"
                               NOR, this_player());
                this_object()->recreate();
                set("poem_said", 1);
                return 1;
        }

        if( arg == "天地崩裂时" && (int)query("poem_said") == 1 )
        {
                write(HIC "\n你对着大堂一声猛喝，声音在司内回荡了好一阵才消逝。\n" NOR);
                return 1;
        }
}

void reset()
{
        ::reset();
        delete("zuo");
        delete("you");
}

void recreate()
{
        set("short", HIB "【轮回司】" NOR);
        set("long", HIB @LONG

                    轮         回         司

    轮回司内寒气森森，青石铺设的地面满是灰尘。堂周青布围幔，围幔
上用金银丝线绣着些奇怪的图案，正堂上一张青石桌案 (table)，桌案的
表层已经脱落，露出内部的一个石制轮盘(lunpan)。

LONG NOR );

        set("item_desc", ([
                "table" : WHT "一个青石制成的桌案，上面有几许"
                          "裂缝，它的表层已经脱落了。\n" NOR,
                "lunpan": WHT "一个石制的轮盘，上面满是花纹，似"
                          "乎可以转动。\n" NOR,
        ]));

        set("exits", ([
                "out" : __DIR__"lunhuisi_road1",
        ]));

        create_door("out", YEL "铜门" NOR, "enter", DOOR_CLOSED);
        setup();
}
