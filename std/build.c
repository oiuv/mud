// write by -Acme-
#include <ansi.h>

inherit ROOM;
inherit F_SAVE;

int isBuild() { return 1; }

void create()
{
    set("short", "空地");
    set("long", "這是一塊什麼也沒有的空地。\n");
    setup();
    restore();
}

string query_save_file() { return file_name(this_object()); }

void init()
{
    // 不是巫師且不是擁有者，是不能有動作的
    if (this_object()->query("owner") != this_player()->query_id() && !wizardp(this_player()))
        return;

    // 一般共用指令
    add_action("do_set_short", "short"); // 設定房間short
    add_action("do_set_long", "long");   // 設定房間long

    if (this_object()->query("_IS_WELL_"))
        add_action("do_drink", "drink");
}

int do_set_short(string arg)
{
    object me;
    me = this_player();

    if (!arg)
        return notify_fail("你要設什麼房間名稱？\n");
    if (strlen(arg) > 10)
        return notify_fail("房間名稱最長為十個字元(五個中文字)。\n");

    this_object()->set("short", arg);
    this_object()->save();

    tell_object(me, "ok.\n");

    return 1;
}

int do_set_long(string arg)
{
    object me;
    me = this_player();

    if (!arg)
        return notify_fail("你要設什麼房間名稱？\n");
    if (strlen(arg) > 100)
        return notify_fail("房間敘述最長為一百個字元(五十個中文字)。\n");

    this_object()->set("long", arg);
    this_object()->save();

    tell_object(me, "ok.\n");

    return 1;
}

// for well
int do_drink(string arg)
{
    int old_time, cd_time;
    object me;

    me = this_player();
    cd_time = 3600;
    old_time = this_object()->query("_IS_WELL_TIME_");

    if (old_time)
    {
        int diff, m, s;
        diff = time() - old_time;
        if (diff < cd_time)
        {
            m = (cd_time - diff) / 60;
            s = (cd_time - diff) % 60;
            tell_object(me, "還要經過 " + chinese_number(m) + "分" + chinese_number(s) + "秒 水井的水才會再產生。\n");
            return 1;
        }
    }

    // 回滿狀態
    me->heal_stat("ap", me->query_stat_maximum("ap"));
    me->heal_stat("hp", me->query_stat_maximum("hp"));
    me->heal_stat("mp", me->query_stat_maximum("mp"));
    message_vision(HIW "$N從水井裡舀起一大桶的水，瘋狂的往嘴裡灌，肚子都漲得凸出來了，瞬間把水喝光了！\n" NOR, me);
    tell_object(me, HIY "(你的狀態完全恢復了！)\n" NOR);

    this_object()->set("_IS_WELL_TIME_", time());
    this_object()->save();

    return 1;
}
