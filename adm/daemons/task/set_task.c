inherit F_DBASE;

#include <ansi.h>

#define ZIXU "/adm/daemons/task/npc/zixu"                 //task发布宣布者
#define TASK_CARRIER "/adm/daemons/task/npc/task_carrier" //task 携带者
#define TASK_OBJECT "/adm/daemons/task/obj/"              //task对象目录
#define MIRROR "/adm/daemons/task/mirror.c"               //宝镜放置的路径

private string *query_reward_pool(int count);
private object prepare_mirror_reward(object me, int count);

void create() {
    seteuid(getuid());
    set("name", HIG "宝镜任务精灵" NOR);
    set("id", "mirror daemon");
    call_out("task_reminder", 20);
}

void task_reminder() {
    object zixu = find_object(ZIXU);
    if (!zixu)
        zixu = load_object(ZIXU);

    CHANNEL_D->do_channel(zixu, "chat", HIR "请注意，宝镜任务将于三分钟后重新分布。" NOR);

    remove_call_out("set_task");
    call_out("set_task", 180);
}

void set_task() {
    object npc, zixu, task, *mirror, mirror_owner, *npc_inv;
    string *i_list, *ip;
    int level, x, i, ii, same, y;

    zixu = find_object(ZIXU);
    if (!zixu)
        zixu = load_object(ZIXU);
    level = random(15) + 1;

    CHANNEL_D->do_channel(zixu, "chat", HIY "宝镜任务重新分布完毕。" NOR);

    remove_call_out("task_reminder");
    call_out("task_reminder", 1020);

    i_list = get_dir(TASK_OBJECT);

    for (x = 0; x < sizeof(i_list); x++) {
        task = find_object(TASK_OBJECT + i_list[x]);
        if (task)
            destruct(task);
    }

    for (x = 0; x < sizeof(i_list); x++) {

        task = find_object(TASK_OBJECT + i_list[x]);
        if (!task) {
            npc = new(TASK_CARRIER);

            task = load_object(TASK_OBJECT + i_list[x]);
            task->set("task_time", time() / 100);

            NPC_D->place_npc(npc, 0);
            if (strsrch(npc->query("long"), "一个拾荒者") > -1) {  //增加npc的伪装
                npc_inv = all_inventory(npc);
                for (y = 0; y < sizeof(npc_inv); y++) {
                    destruct(npc_inv[y]);
                }
                npc->carry_object("/clone/cloth/cloth")->wear();
                npc->set("combat_exp", 1);
            } else {
                NPC_D->set_from_me(npc, zixu, random(100) + 1);
                npc->add_temp("apply/attack", npc->query_skill("force") *
                    (level - 1) / 15);
                npc->add_temp("apply/dodge", npc->query_skill("force") *
                    (level - 1) / 15);
                npc->add_temp("apply/parry", npc->query_skill("force") *
                    (level - 1) / 15);
                npc->add_temp("apply/damage", 5 + level * 7);
                npc->add_temp("apply/unarmed_damage", 5 + level * 7);
                npc->add_temp("apply/armor", 10 + level * 15);
            }
            task->move(npc);
            NPC_D->random_move(npc);
            NPC_D->random_move(npc);
            NPC_D->random_move(npc);
            NPC_D->random_move(npc);
        }
    }

    mirror = children(MIRROR);

    if (sizeof(mirror) == 1)
        return;  //只有主对象没有任何clone出来的

        for (i = 0; i < sizeof(mirror); i++) {

            if (!clonep(mirror[i]))
                continue;  //若是主对象不注入

                mirror_owner = environment(mirror[i]);

            if (query_ip_number(mirror_owner) == 0) {
                destruct(mirror[i]);
                tell_object(mirror_owner, "你目前没有ip地址，因此"
                    "这块宝镜天神予以没收。\n");
                continue;
            }

            if (!ip) {
                ip = ({ query_ip_number(mirror_owner) });

                mirror[i]->set("power", 100);
                tell_object(mirror_owner, HIR "只见一道红光注入你的乾坤宝"
                    "镜里面，使它顿时有了灵气。\n" NOR);
                continue;
            } else {
                same = 0;
                for (ii = 0; ii < sizeof(ip); ii++) {
                    if (query_ip_number(mirror_owner) == ip[ii])
                        same = 1;
                }
                if (same == 1) {
                    destruct(mirror[i]);
                    tell_object(mirror_owner, "你所在ip还有另外的宝镜，"
                        "这块宝镜天神予以没收。\n");
                } else {
                    ip += ({ query_ip_number(mirror_owner) });
                    mirror[i]->set("power", 100);
                    tell_object(mirror_owner, HIR "只见一道红光注入你的乾坤宝"
                        "镜里面，使它顿时有了灵气。\n" NOR);
                }
            }
        }
}

int do_return(object ob, object me, string arg) {
    string target, item;
    object who, pay, reward_item;
    int count, total, exp, pot /*, tihui, gx*/;
    //增加阅历奖励 2016-12-21
    int score;
    int kar;

    if (!arg)
        return notify_fail("你要给谁什么东西？\n");

    if (!objectp(ob) || environment(ob) != me)
        return 0;

    if (sscanf(arg, "%s to %s", item, target) != 2 &&
        sscanf(arg, "%s %s", target, item) != 2)
        return 0;

    if (item != ob->query("id"))
        return 0;

    who = present(target, environment(me));

    if (!objectp(who))
        return notify_fail("这里没有这个人。\n");

    if (who->query("id") != ob->query("owner_id"))
        return 0;

    if (!living(who))
        return notify_fail("你还是得等人家醒了再说吧。\n");

    total = me->query("mirror_count") + 1;
    if (sizeof(query_reward_pool(total))) {
        reward_item = prepare_mirror_reward(me, total);
        if (!objectp(reward_item))
            return 1;  // This give action is handled; keep the quest item.
    }

    if (me->query("mirror_task/task_time") != ob->query("task_time")) {
        me->delete("mirror_task");
        me->set("mirror_task/task_time", ob->query("task_time"));
    }

    me->add("mirror_task/count", 1);
    me->add("mirror_count", 1);
    me->add("state/mirror", 1);

    count = me->query("mirror_task/count");

    //调整task任务pot奖励 2017-02-02
    exp = (100 + random(100)) * count;
    //宝镜定位越用灵力越低定位越模糊，也就是说每次更新一轮的30个任务内越后来寻找难度越大，故越后来pot奖励越大 2017-02-02
    //进一步提高task任务奖励。其实作为手动任务，如果不是因为担心出现全自动task机器人严重影响平衡，task任务的奖励还应该大得多。 2017-02-24
    if (count > 20)
        pot = 2000 + random(2000);
    else if (count > 10)
        pot = 1000 + random(1000);
    else if (count > 5)
        pot = 500 + random(500);
    else
        pot = 100 + random(100);

    if (count == 10)
        pot += 1000;
    if (count == 20)
        pot += 4000;
    if (count == 30)
        pot += 10000;  //每次更新30个task物品，故30个全部完成理应加大奖励幅度（我怎么感觉30个全完成是不可能的事情。。。） 2017-02-02

        // gx = 1 + random(3);
        kar = me->query("kar");  //修改阅历增加和福缘挂钩 2016-12-21
        score = 10 + random(kar);
    me->add("combat_exp", exp);
    me->add("potential", pot);
    // me->add("gongxian", gx);
    me->add("score", score);
    // me->add("experience", tihui);
    me->delete("xquest/mirror");

    tell_object(me, "你拿出" + ob->name() + "(" + ob->query("id") + ")给" +
        who->name() + "。\n" + WHT + who->name() + "说道：“啊，真是多谢这位" +
        RANK_D->query_respect(me) + "了。”\n" NOR);

    tell_object(me, HIY "这是你这一轮完成的第" + HIR +
        chinese_number(me->query("mirror_task/count")) + NOR + HIY "个宝镜任务。\n" NOR +
        HIG "通过这次锻炼，你获得了" NOR HIR + chinese_number(exp) +
        HIG "点经验，" NOR HIW + chinese_number(pot) + NOR HIG "点潜能。\n" NOR HIW "外加奖励十两白银。\n" NOR);
    if (me->query("mirror_count")) {
        tell_object(me, HIY "你累计已完成" + HIR +
            chinese_number(me->query("mirror_count")) + NOR + HIY "个宝镜任务。\n" NOR);
    }
    message("vision", me->name() + "拿出" + ob->name() + "(" + ob->query("id") + ")给" + who->name() + "。\n" + WHT + who->name() + "说道："
        "“啊，真是多谢这位" + RANK_D->query_respect(me) + "了。”\n" NOR,
        environment(me), ({ me }));

    pay = new("/clone/money/silver");
    pay->set_amount(10);
    pay->move(me, 1);

    /*  log_file("static/mirror", sprintf("%s(%s) 交物品 at %s.\n",
             me->name(1), me->query("id"), ctime(time())));  */

    destruct(ob);
    if (objectp(reward_item)) {
        if (total == 500)
            me->delete("mirror_count");
        tell_object(me, HIG "你获得了一" +
            (reward_item->query("base_unit") || reward_item->query("unit")) + NOR +
            reward_item->name() + "\n");
    }
    return 1;
}

private string *query_reward_pool(int count) {
    //task增加100、200、400任务奖品 by 薪有所属
    // 完成100个task：美容丸、福源丹
    string *ob1_list = ({
        "/clone/fam/gift/perwan",
        "/clone/fam/gift/kardan",
        "/clone/fam/etc/prize4",  //圣杯
        "/clone/fam/etc/prize5",  //神圣血清
    });

    // 完成200个task：7成丹
    string *ob2_list = ({
        "/clone/fam/gift/str2",
        "/clone/fam/gift/int2",
        "/clone/fam/gift/con2",
        "/clone/fam/gift/dex2",
    });

    // 完成300个task：85成丹
    string *ob3_list = ({
        "/clone/fam/gift/str3",
        "/clone/fam/gift/int3",
        "/clone/fam/gift/con3",
        "/clone/fam/gift/dex3",
    });

    // 完成400个task：稀有特殊合成材料
    string *ob4_list = ({
        "/clone/fam/item/xuantie",  //天山玄铁（100point，打造刀、剑）
        "/clone/fam/etc/bipo",
        "/clone/fam/etc/huanshi",
        "/clone/fam/etc/binghuozhu",
        "/clone/fam/etc/leishenzhu",
    });

    // 完成500个task：无花果
    string *ob5_list = ({
        "/clone/fam/obj/guo",
        "/clone/fam/max/xuanhuang",
        "/clone/fam/max/longjia",
    });
    switch (count) {
        case 100: return ob1_list;
        case 200: return ob2_list;
        case 300: return ob3_list;
        case 400: return ob4_list;
        case 500: return ob5_list;
    }
    return ({});
}

private object prepare_mirror_reward(object me, int count) {
    string *pool, path;
    object item;
    int max_weight, item_weight;

    pool = query_reward_pool(count);
    foreach (path in pool) {
        item_weight = load_object(path)->weight();
        if (item_weight > max_weight)
            max_weight = item_weight;
    }
    // Check before choosing: insufficient capacity must not filter the pool.
    if (me->query_encumbrance() + max_weight > me->query_max_encumbrance()) {
        tell_object(me, "你的行囊太满，腾出足够地方领取奖品后再来交还失物吧。\n");
        return 0;
    }
    item = new(pool[random(sizeof(pool))]);
    if (!item->move(me)) {
        destruct(item);
        tell_object(me, "奖品一时无法交到你手中，请整理行囊后再来交还失物。\n");
        return 0;
    }
    return item;
}
