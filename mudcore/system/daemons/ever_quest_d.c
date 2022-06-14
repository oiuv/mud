/**
 * @file ever_quest_d.c
 * @author 雪风@Mud.ren
 * @brief 自由任务守护进程，适合自动生成的随机任务，如悬赏
 * @version 1.0
 * @date 2021-12-05
 *
 * @copyright Copyright (c) 2021
 *
 */
#include <ansi.h>
inherit CORE_DBASE;
// 任务对象的系统状态
#define QUEST_CREATE            "created" /* 任务创建     */
#define QUEST_READY             "ready"   /* 任务就绪     */
#define QUEST_FINISH            "finish"  /* 任务完成     */
#define QUEST_ERROR             "error"   /* 任务错误状态 */

// 任务对象的系统事件
#define QUEST_TIMEOUT           "timeout" /* 任务超时     */

// 在创建状态最长的停留时间
#define QUEST_CREATE_PERIOD     30

// 在结束状态最长的停留时间
#define QUEST_FINISH_PERIOD     30

#ifndef EVER_QUEST_DIR
#define EVER_QUEST_DIR CORE_DIR "EverQuest/"
#endif
#ifndef EVER_QUEST
#define EVER_QUEST EVER_QUEST_DIR "quest"
#endif

public void add_quest(object qob);
public void set_information(object qob, string key, mixed info);
public mixed query_information(object qob, string key);
public void remove_information(object qob, string key);
public void remove_all_information(object qob);
public void start_all_quest();
public string generate_information(object knower, object who, string topic);

/***********************************************************
  系统注册任务概念

    HELL采用任务对象来管理众多各式各样的任务，而任务守护进程
就是他们的管理者。为什么需要任务对象？这是因为大部分任务都具
有类似的处理过程：收集情报，根据线索完成某些要求，实现最终任
务，获得奖励。为了能够快速的编写和实现多种任务，共享重复的实
现代码，系统规定了任务对象的格式，只要遵循任务对象的格式，就
可以快速的生成玩家任务。

    让我们首先看一下任务的结构：一个任务实际上就是一个自动机，
然后由玩家不断的触发这个自动机最后达到一个稳定状态，一般来说
就是任务成功或是终止。系统可以为任务对象制定一些标准事件，然
后由任务的设计者自己制定一些事件，这就组合成了一个任务的输入
事件，然后系统为任务维护一个状态，这样就构成了一个完整的自动
机。

    看一个简单的“杀人”任务。

    杀一个人主要需要三个要素：时间、地点、人物。在某一个时间，
某个地点出现一个人物，杀掉它就算完成，可以获得奖励。那么我们
设计的流程预期是这样的：一个人打听到了这个任务，就去相应的地
点，杀人，杀掉以后获得奖励。

    任务对象的自动机器：

                                      消息收集完全
            <原生态> -> 人物生成态 -----------+
                           /                  |
                 <Timeout>/    <Timeout>      |
                   -------<---------------\   |
                 /                         \  v
            <结束态>   <--------------- 人物出现态
                            杀死该人

<原生态>和<结束态>是系统规定的状态，<Timeout>是系统原先保留
的事件。而人物生成态和人物出现态是该任务特有的状态，另外消息
收集完全和杀死该人则是该任务对象特有的事件。

<原生态>阶段系统初始化任务对象，完成一些必要的操作，并将控制
权传递给任务对象以进行后续的操作。这时该任务就自动生成一个人
物，制定它的等级，正邪，预期出现的地点，打听的难度等等。然后
就进入到人物生成态，同时表明自己需要接受超时事件。

此时，玩家如果打听消息，有可能打听到这个任务，并经过反复打听，
获得了该人出现的地点信息，则该人物对象认为消息收集完全，就真
正的生成这个人物，等候玩家将它消灭。

如果该人物被消灭，则通知任务对象，人物对象转移到<结束态>。另
外一个进入结束态的可能是超时了。

进入<结束态>，系统自动清除该任务对象。

任务产生：这可以是游戏中的机关产生，故事产生，和系统随机产生
等等。只要调入一个对象，就可以产生任务。

任务消息：除了通常的消息，有一种消息即通过电脑控制的人物产生，
包括店小二和特殊的传递消息的人物，这些消息可以反映出当前任务
的一些信息，这些功能已经由系统封装。任务产生以后，系统调用接
口函数：register_information()来登记和任务相关的消息--为什
么不在任务产生的同时由任务自己登记？这是因为任务守护进程有可
能析构后重新创建，这样将遗失所有登记的数据，此时任务守护进程
就会遍历系统中所有的任务，调用register_information()接口来
重新组织这些消息。

消息数据结构：

---+-- scheme(1) -*
   |
   +-- scheme(2) -*
   |
   +-- scheme(3) --+-- 关键字：消息1
                   |
                   +-- 关键字：消息2
                   |
                   .........

打听需要一定的江湖阅历，当random(江湖阅历) > 消息的时候，就
有可能打听到这个消息。消息可能是一个函数，如果是这样的话，在
打听消息的时候系统把打听的对象和打听消息的人，关键字传递给该
函数，取它的返回结果。

QUEST_D提供的消息API：

QUEST_D->add_quest(QUEST_OBJECT);
QUEST_D->set_information(QUEST_OBJECT, key, information);
QUEST_D->query_information(QUEST_OBJECT, key);
QUEST_D->remove_information(QUEST_OBJECT, key);
QUEST_D->remove_all_information(QUEST_OBJECT);

QUEST_OB必须提供的消息接口：

QUEST_OB->register_information();
QUEST_OB->name();
QUEST_OB->can_know_by(object knower);
QUEST_OB->can_rumor_by(object knower);
QUEST_OB->query_introduce(object knower, object who);

***********************************************************/

// 系统增加一个任务
public void add_quest(object qob)
{
    mapping total;

    if (!mapp(total = query("information")))
    {
        // 原先没有任何任务
        total = ([qob:1]);
        set("information", total);
    }
    else
    {
        // 查看这个任务是否已经有定义
        if (undefinedp(total[qob]))
            // 增加一个任务，因为这时候刚刚将任
            // 务加入，还没有任何相关的具体信息，
            // 所以这个条目对应的就只是一个简单
            // 整数标识。
            total[qob] = 1;
    }
}

// 设置消息
public void set_information(object qob, string key, mixed info)
{
    mapping total;
    mapping all_info;

    if (!stringp(key) || (!stringp(info) && !functionp(info)))
    {
        return;
    }

    if (!mapp(total = query("information")))
        total = ([]);

    if (!mapp(all_info = total[qob]))
    {
        // 原先没有该任务对象的消息信息
        all_info = ([]);
        total += ([qob:all_info]);
    }

    all_info[key] = info;
    set("information", total);
}

// 查询消息
public mixed query_information(object qob, string key)
{
    mapping total;
    mapping all_info;

    if (!mapp(total = query("information")))
        return 0;

    if (!mapp(all_info = total[qob]))
        return 0;

    return all_info[key];
}

// 删除消息
public void remove_information(object qob, string key)
{
    mapping total;
    mapping all_info;

    if (!mapp(total = query("information")))
        return;

    if (!mapp(all_info = total[qob]))
        return;

    map_delete(all_info, key);
    if (!sizeof(all_info))
    {
        // 该任务对象已经没有消息了
        map_delete(total, qob);
        return;
    }
}

// 删除某一个对象的所有消息
public void remove_all_information(object qob)
{
    mapping total;

    if (!mapp(total = query("information")))
        return;

    // 在删除所有消息的同时，任务本身也去掉了 -- 为什么
    // 这样做，这是因为如果是一个没有任何消息的任务（仅
    // 靠任务介绍提供信息）调用这个函数的含义就是清除任
    // 务本身，而一个提供消息的任务清除所有消息也具有相
    // 同的含义。
    map_delete(total, qob);
}

// 删除某一个任务
public void remove_quest(string name)
{
    mapping total;
    object *obs;
    object qob;

    if (!mapp(total = query("information")))
        return;

    obs = keys(total);
    obs = filter_array(obs, (: objectp($1) :));

    if (!sizeof(obs))
        return;

    qob = find_object(name);
    if (!objectp(qob) || member_array(qob, obs) == -1)
    {
        obs = filter_array(obs, (: $1->name() == $(name) :));
        if (!sizeof(obs))
            return;
        qob = obs[0];
    }

    remove_all_information(qob);
    return;
}

// QUEST系统重新启动的时候收集所有任务对象的消息
protected void collect_all_quest_information()
{
    mapping total;
    object qob;
    object *obs;

    CHANNEL_D->do_channel(this_object(), "sys", "任务精灵开始收集所有的任务信息。");

    if (!mapp(total = query("information")))
    {
        total = ([]);
        set("information", total);
    }

    obs = filter_array(objects(), (: $1->is_quest() :));

    // 扫描所有的QUEST对象，登记信息
    foreach (qob in obs)
    {
        reset_eval_cost();
        total[qob] = 0;
        catch (qob->register_information());
    }

    // 唤醒几个子任务守护进程
    start_all_quest();
}

public void start_all_quest()
{
    string quest;
    string *qlist;
    string name;
    int pos;

    quest = read_file(EVER_QUEST);
    if (!stringp(quest))
        // 配置文件中没有任务
        return;

    qlist = explode(quest, "\n");
    foreach (name in qlist)
    {
        // 防止运行超时
        reset_eval_cost();

        if (strlen(name) < 1 || name[0] == '#')
            // 空行或者是注释行
            continue;

        // 去掉行尾的注释和空格
        pos = strsrch(name, '#');
        if (pos > 1)
            name = name[0..pos - 1];
        name = replace_string(name, " ", "");

        // 生成文件名字
        name = EVER_QUEST_DIR + name + ".c";
        if (file_size(name) < 0)
        {
            // 没有这个任务
            continue;
        }

        // 启动这个任务
        catch (call_other(name, "startup"));
    }
}

// 整理所有的任务
protected void heart_beat()
{
    mapping total;
    mixed key;
    int live_time;
    int t;

    // 重新启动所有的任务进程：如果因为某种故障停止运行，
    // 此时可以将它们重新启动，如果他们原本没有出故障，
    // 那么此时重新启动会修改它们的心跳时间。
    start_all_quest();

    if (!mapp(total = query("information")))
        return;

    // 计算当前时间
    t = time();

    // 扫描所有的任务，只保留有效的任务
    foreach (key in keys(total))
    {
        reset_eval_cost();
        if (!objectp(key))
            map_delete(total, key);
        else
            switch (key->query_status())
            {
            case QUEST_CREATE:
                if (t - key->query("start_time") > QUEST_CREATE_PERIOD)
                {
                    // 创建任务超过有效时间了，结束之
                    catch (key->change_status(QUEST_FINISH));
                    map_delete(total, key);
                }
                break;

            case QUEST_FINISH:
                if (t->query("finish_time") > QUEST_FINISH_PERIOD)
                    // 结束任务超过有效时间了
                    key->change_status(QUEST_ERROR);
                break;

            case QUEST_ERROR:
                // 任务在运行错误状态中
                break;

            default:
                // 任务在通常运行状态中
                if ((live_time = key->query("live_time")) > 0 &&
                    live_time < t - key->query("start_time"))
                {
                    // 生存超过了时间
                    catch (key->change_status(QUEST_FINISH));
                    map_delete(total, key);
                }
                break;
            }
    }
}

// 供消息灵通人士调用使用
public string generate_information(object knower, object who, string topic)
{
    mapping total;
    object *obs;
    object *dest;
    string name, title;
    object last_ob;
    mixed answer;

    total = query("information");

    switch (random(30))
    {
    case 0:
        return "阿嚏！有点感冒，不好意思。";
    case 1:
        return "等…等等，你说什么？没听清楚。";
    case 2:
        return "嗯，稍等啊，就好…好了，你刚才说啥？";
    case 3:
        return "这个…这个…哦，好了，啊？你问我呢？";
    case 4:
        return "唉呦！不好意思，是你问我么？";
    case 5:
        return "就好…就好…好了，你说啥？";
    case 7:
        return "嗯，你稍等一下，我这里还没忙完。";
    }

    if (topic == "rumor" || topic == "消息")
    {
        // 生成传闻
        if (!mapp(total) ||
            !sizeof(obs = filter_array(keys(total), (: objectp($1) :))))
        {
            // 目前没有任何任务
            switch (random(3))
            {
            case 0:
                return "最近没啥消息。";
            case 1:
                return "好像最近挺太平的。";
            default:
                return "不知道...你去问问别人吧。";
            }
        }

        // 过滤该小二可以散布的消息
        obs = filter_array(obs, (: objectp($1) && $1->can_rumor_by($(knower)) :));
        if (!sizeof(obs))
        {
            // 该人士不能散布信息
            switch (random(3))
            {
            case 0:
                return "我倒是听说最近出了不少事儿。";
            case 1:
                return "哎呀呀！你也知道了一些秘密？快给我说说！";
            default:
                return "这年头，是越来越乱了。";
            }
        }

        // 随机选择一个可以散布的任务消息
        last_ob = obs[random(sizeof(obs))];
        knower->set_temp("last_asked_quest", last_ob);
        if (answer = last_ob->query_prompt(knower, who))
            return answer;

        switch (random(3))
        {
        case 0:
            return "你可曾听过最近有关『" HIY + last_ob->name() + NOR CYN "』的传闻？";
        case 1:
            return "最近正在盛传『" HIY + last_ob->name() + NOR CYN "』这件事情呢！";
        default:
            return "你没有听到大家都在议论『" HIY + last_ob->name() + NOR CYN "』吗？";
        }
    }

    if (!mapp(total))
        return 0;

    // 获得该人知道的所有任务信息
    obs = filter_array(keys(total), (: objectp($1) :));
    obs = filter_array(obs, (: $1->can_know_by($(knower)) :));

    // 查看是否问某一个任务的某一个条目
    if (sscanf(topic, "%s.%s", name, title) == 2)
    {
        dest = filter_array(obs, (: $1->name() == $(name) :));
        if (!sizeof(dest))
            return 0;

        last_ob = dest[0];
    }
    else
    {
        // 查看是否问某一个任务
        dest = filter_array(obs, (: $1->name() == $(topic) :));
        if (sizeof(dest) > 0)
        {
            last_ob = dest[0];
            knower->set_temp("last_asked_quest", last_ob);
            answer = last_ob->query_introduce(knower, who);
            if (stringp(answer))
                return answer;
            return "你说的是" HIY + knower->name() + HIY "那件事情吗？你问我算是问对人了。" NOR;
        }
        else
        // 查看最后一次被询问的任务消息中是否有该条目
        {
            last_ob = knower->query_temp("last_asked_quest");
            if (!objectp(last_ob) || !mapp(total[last_ob]))
                return 0;

            title = topic;
        }
    }

    // 返回有关某个任务的某个条目的消息
    knower->set_temp("last_asked_quest", last_ob);
    answer = total[last_ob];

    if (!mapp(answer))
        return 0;

    // 这个任务登记了具体的信息
    answer = answer[title];
    if (functionp(answer))
        return evaluate(answer, knower, who, topic);

    if (stringp(answer))
        return answer;

    return 0;
}
