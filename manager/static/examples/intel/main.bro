@load frameworks/intel/seen

redef Intel::read_files += {
  fmt("%s/intel-1.dat", @DIR)
};
