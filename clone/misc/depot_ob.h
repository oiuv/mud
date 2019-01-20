// 如意乾坤袋(Written by Lonely@chinamud.cn)
// Modified by Ivy@mud.ren 

#include <ansi.h>
#include <config.h>

inherit ITEM;
inherit F_NOCLONE;
inherit F_OBSAVE;

int is_item_make() { return 1; }
int is_depot_ob() { return 1; }
int clean_up() { return 1; }
int store_item(object me, object ob, int amount);

class store {
        string name, id, file;
      //string *ids;
        int amount;
}
STATIC_VAR_TAG class store *all = ({});

void create()
{
        set_name(HIW "如意" HIG "乾" HIY "坤" HIC "袋" NOR, ({ "ruyi dai", "ruyi", "dai" }));
        set_weight(100);
        set("long", HIC "    一个四周环绕着神秘光环的如意乾坤袋，其炼制手法堪称巧夺天工。"
                    "据说可以将东西无限制的存（" NOR HIY "store" NOR HIC "）进去,不会丢失，且无论什么时候都可以取"
                    "（"NOR HIY "take" NOR HIC"）出来。\n" NOR);
        set("unit", "个");
        set("value",1000);
        set("no_drop", 1);
        set("no_steal", 1);
        set("no_store", 1);
        set("no_sell", "如意乾坤袋你也舍得卖掉？\n");
        setup();

        ::restore();
}
/*
string short()
{
    if(this_player())
         return HIC + this_player()->query("name") + HIW "的" HIM "如意" HIG "乾" HIY "坤" HIB "袋" NOR "(Ruyi Dai)"; 
}
*/
string extra_long()
{
        mixed ob_name_real_len;
        string msg;

        if( !all || sizeof(all) < 1 )
                return "\n这个如意乾坤袋里没有存放任何物品。\n";

        msg = HIW "\n这个如意乾坤袋里存放的物品有：\n编号  物品                                      数量\n"
                  "────────────────────────────────\n" NOR;
        for( int i=0; i<sizeof(all); i++ ) {

                ob_name_real_len = color_len(all[i]->name + "(" + all[i]->id + ")");

                //msg += sprintf("[%2d]  %-" + (36 + ob_name_real_len) + "s      %-11d\n",
                msg += sprintf("[%2d]  %-" + (36) + "s      %-11d\n",
                               i+1, all[i]->name + "(" + all[i]->id + ")",
                               all[i]->amount);
                if (all[i]->amount == 0)
                        all[i] = 0;
        }
        msg += HIW "────────────────────────────────\n" NOR;
        all -= ({ 0 });
        return msg;
}

void init()
{
        add_action("do_store", "store");
        add_action("do_take",  "take");
}

int do_take(string arg)
{
        object me, ob;
        object *obs;
        int n, amount, num;
//      string *ks;
        string /*k,*/ un;

        me = this_player();

        if( me->is_busy() ) return notify_fail("你正忙着呢。\n");

        if( !arg || sscanf(arg, "%d %d", n, amount) != 2 )
                return notify_fail("格式错误，请用 take 编号 数量 来取回物品。\n");

        if( amount < 1 || amount > 10000 )
                return notify_fail("每次取物品的数量不得小于一同时也不能大于一万。\n");

        if( n < 1 ) return notify_fail("你要取第几号物品？\n");

        if( !all || sizeof(all) < 1 || n > sizeof(all) )
                return notify_fail("你的如意乾坤袋里没有存放这项物品。\n");
        n--;
        if( amount > all[n]->amount )
                amount = all[n]->amount;

        if( !(ob = new(all[n]->file)) ) {
                all[n] = 0;
                all -= ({ 0 });
                tell_object(me, "无法取出该物品，系统自动清除之。\n");
                return 1;
        }

        obs=filter_array(all_inventory(me),(:!$1->query("equipped"):));
        if (sizeof(obs) >= MAX_ITEM_CARRIED &&
            ! ob->can_combine_to(me))
                return notify_fail("你身上的东西实在是太多了，没法再拿东西了。\n");

        if( me->query_encumbrance() + ob->query_weight() * amount > me->query_max_encumbrance() ) {
                tell_object(me, "你的负重不够，无法一次取出这么多物品。\n");
                destruct(ob);
                return 1;
        }

        if (ob->query("unit"))
                un = ob->query("unit");
        else
                un = ob->query("base_unit");

        if( ob->query_amount() ) {
                all[n]->amount -= amount;
                if( all[n]->amount == 0 ) {
                        all[n] = 0;
                        all -= ({ 0 });
                }
                ob->set_amount(amount);
                ob->move(me, 1);
                save();

                message_vision("$N从如意乾坤袋里取出一" +
                                un + ob->query("name")+"。\n",me);
                return 1;
        }
        destruct(ob);

        if( amount > 100 ) amount = 100;
        all[n]->amount -= amount;
        num = amount;
        while( num-- ) {
                ob = new(all[n]->file);
                if( ob->query("equipped")) ob->delete("equipped");
                ob->move(me, 1);
        }

        message_vision("$N从如意乾坤袋里取出" + chinese_number(amount) +
                        un + ob->query("name")+"。\n",me);

        if( !wizardp(me) && random(2) )
                me->start_busy(3);

        if( all[n]->amount == 0 ) {
                all[n] = 0;
                all -= ({ 0 });
        }
        save();
        return 1;
}

int do_store(string arg)
{
        int i, n/*, k*/, amount;
        string item;
        object me, ob1, ob2, *inv;

        me = this_player();

        if( !arg ) return notify_fail("你要存放什么东西？\n");

        if( me->is_busy() ) return notify_fail("你正在忙着呢！\n");

        n = 100;

        if( sizeof(all) >= n )
        {
                return notify_fail("你如意乾坤袋的 " + n + " 个储藏空间全被使用了，请整理一下吧。\n");
        }

        if( arg == "all" ) {
                inv = all_inventory(me);
                inv -= ({ this_object() });
                inv -= ({ 0 });
                inv = filter_array(inv, (: $1->query_autoload() && !$1->is_item_make() &&
                                          !$1->query("equipped") && !$1->query("money_id") :));
                n = sizeof(inv);
                if( n > 100 )
                {
                        tell_object(me, "你身上的物品太多了，很容易搞混，你还是一个一个存吧。\n");
                        return 1;
                }

                if( n < 1 )
                {
                        tell_object(me, "你身上没有任何可以保存的物品。\n");
                        return 1;
                }

                for( i=0; i<n; i++ )
                {
                        do_store(inv[i]->query("id"));
                }
                return 1;
        } else if (sscanf(arg, "%d %s", amount, item) == 2) {
                if( !objectp(ob1 = present(item, me)) )
                        return notify_fail("你身上没有这样东西。\n");

                if( !ob1->query_amount() )
                        return notify_fail(ob1->name() + "不能被分开存放。\n");

                if( amount < 1 )
                        return notify_fail("存东西的数量至少是一个。\n");

                if( amount > ob1->query_amount() )
                        return notify_fail("你没有那么多的" + ob1->name() + "。\n");

                if( amount == (int)ob1->query_amount() ) {
                        return store_item(me, ob1, amount);
                } else {
                        ob1->set_amount((int)ob1->query_amount() - amount);
                        ob2 = new(base_name(ob1));
                        ob2->set_amount(amount);
                        if( !store_item(me, ob2, amount) ) {
                                ob2->move(me, 1);
                                return 0;
                        }
                        return 1;
                }
        }

        if( !objectp(ob1 = present(arg, me)) )
                return notify_fail("你身上没有这样东西。\n");

        if( ob1->query_amount() )
                return do_store(ob1->query_amount() + " " + arg);

        store_item(me, ob1, 1);
        return 1;
}

int store_item(object me, object ob, int amount)
{
        class store item;
        int i, n;
        string file, name, id, un;

        if( !objectp(ob) ) {
                error("no this object!\n");
                return 0;
        }

        if( file_size(base_name(ob) + ".c") < 0 )
                return 0;

        if( inherits(F_SILENTDEST, ob) ) {
                tell_object(me,"如意乾坤袋不保存" + ob->query("name")+"，请你自己妥善处理。\n");
                return 0;
        }

        if( inherits(F_UNIQUE, ob) ) {
                tell_object(me,"如意乾坤袋不保存" + ob->query("name")+"，请你自己妥善处理。\n");
                return 0;
        }

        if( member_array(ITEM + ".c", deep_inherit_list(ob)) == -1 &&
            member_array(COMBINED_ITEM + ".c", deep_inherit_list(ob)) == -1 ) {
                tell_object(me,"如意乾坤袋不保存" + ob->query("name")+"，请你自己妥善处理。\n");
                return 0;
        }

        if( ! ob->query_autoload()) {
                tell_object(me,"如意乾坤袋不保存" + ob->query("name")+"，请你自己妥善处理。\n");
                return 1;
        }

        if( ob->query("money_id")) {
                tell_object(me,"存钱请找钱庄老板存(deposit)。\n");
                return 1;
        }

        if( ob->query("no_store") || ob->is_no_clone() || ob->query("no_put")){
                tell_object(me,"如意乾坤袋不保存" + ob->query("name")+"，请你自己妥善处理。\n");
                return 0;
        }

        if( ob->is_character() || ob->is_item_make() || !clonep(ob) ) {
                tell_object(me,"如意乾坤袋不保存" + ob->query("name")+"，请你自己妥善处理。\n");
                return 0;
        }

        switch( ob->query("equipped")){
        case "worn":
                tell_object(me, ob->name() + "必须先脱下来才能存放。\n");
                return 0;
        case "wielded":
                tell_object(me, ob->name() + "必须先解除装备才能存放。\n");
                return 0;
        }

        if( sizeof(all_inventory(ob)) ) {
                tell_object(me,"请你先把" + ob->query("name")+"里面的东西先拿出来。\n");
                return 0;
        }

        name = ob->query("name");
        file = base_name(ob);
        id = ob->query("id");
        if (ob->query("base_unit"))
                un = ob->query("base_unit");
        else
                un = ob->query("unit");

        n = sizeof(all);
        for( i=0; i<n; i++ ) {
                if( all[i]->file == file &&
                    all[i]->id == id &&
                    all[i]->name == name ) {
                        all[i]->amount += amount;
                        save();
                        message_vision("$N把"+chinese_number(amount) + un+
                                        ob->query("name")+"存到如意乾坤袋里。\n",me);
                        destruct(ob);
                        return 1;
                }
        }

        item = new(class store);
        item->file = file;
        item->name = name;
        item->id = id;
      //item->ids = ob->parse_command_id_list();
        item->amount = amount;
        all += ({ item });
        save();
        message_vision("$N把"+chinese_number(amount) + un+
                        ob->query("name")+"存到如意乾坤袋里。\n",me);
        destruct(ob);
        return 1;
}


int receive_summon(object me)
{
        object env;

        if( (env = environment()) && env == me ) {
                write(name() + "不就在你身上嘛？你召唤个什么劲？\n");
                return 1;
        }

        if( env == environment(me) ) {
                message_vision(HIG "只见地上的" + name() +
                               HIG "化作一道光芒，飞跃至$N" HIW
                               "的掌中！\n\n" NOR, me);
        } else {
                if( env ) {
                        if( env->is_character() && environment(env) )
                                env = environment(env);

                        message("vision", HIG "突然" + name() + HIG "化作一道"
                                HIG "光芒消失了！\n\n" NOR, env);

                        if( interactive(env = environment()) ) {
                                tell_object(env, HIM + name() +
                                                 HIM "忽然离你而去了！\n" NOR);
                        }
                }

                message_vision(HIM "一道光芒划过，只见$N"
                               HIM "掌中多了一个$n" HIM "！\n" NOR,
                               me, this_object());
        }

        if( !this_object()->move(me) )
                tell_object(me, HIR "由于你的负重太高，"+this_object()->name()+HIR "化作一道光芒，已然了无踪迹。\n" NOR);
        return 1;
}

int hide_anywhere(object me)
{
        if( me->query("jingli") < 100){
                tell_object(me, "你试图令" + name() +
                            "遁去，可是精力不济，难以发挥它的能力。\n");
                return 0;
        }
        me->add("jingli", -100);

        message_vision(HIB "$N" HIB "轻轻一挥手，" + name() +
                       HIB "已然了无踪迹。\n" NOR, me);
        save();
        destruct(this_object());
        return 1;
}

/*
int receive_dbase_data(mixed data)
{
        if( !mapp(data) || sizeof(data) < 1 )
                return 0;

        if( data["all"] )
                all = data["all"];

        return 1;
}

mixed save_dbase_data()
{
        mapping data;

        data = ([]);

        if( sizeof(all) > 0 )
                data += ([ "all" : all ]);

        return data;
}
*/

// 接受存盘数据的接口函数
int receive_dbase_data(mixed data)
{
        int i, n;
        class store item;

        if( !mapp(data) || sizeof(data) < 1 )
                return 0;

        n = sizeof(data);
        for( i=0; i<n; i++ ) 
        {
                item = new(class store);
                item->name = data["item" + i]["name"];
                item->id = data["item" + i]["id"];
                item->file = data["item" + i]["file"];
                item->amount = data["item" + i]["amount"];
                all += ({ item });
        }
        return 1;
}

// 进行保存数据的接口函数
mixed save_dbase_data()
{
        mapping data,list;
        int i, n;
        data = ([]);

        if( sizeof(all) > 0 )
        {
                n = sizeof(all);
                for( i=0; i<n; i++ ) 
                {
                        list = ([]);
                        list["name"] = all[i]->name;
                        list["id"] = all[i]->id;
                        list["file"] = all[i]->file;
                        list["amount"] = all[i]->amount;
                        data += ([ "item" + i :list]); 
                }
        }
        return data;
}
